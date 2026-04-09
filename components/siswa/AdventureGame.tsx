import React, { useState, useEffect, useRef } from 'react';
import { AdventureTileType, Position, NPC } from '../../types';
import { Avatar } from '../shared/Avatar';
import { Button } from '../shared/Button';
import { Joystick } from '../shared/Joystick'; 
import { GameHUD } from '../shared/GameHUD'; 
import { MessageCircle, Trophy, AlertCircle, Play, Loader2, Wifi, WifiOff, Sparkles, LogOut, X } from 'lucide-react';
import { supabase, UserData } from '../../lib/supabase';
import { getLevelFromXP } from '../../lib/levelSystem';
import { useAppContext } from '../../lib/AppContext'; 
import { useAdventureGame } from '../../hooks/useAdventureGame';
import { generateAdventureMapAI, generateAdventureQuestionsAI } from '../../services/gemini';
import { getCompletedTopics } from '../../data/curriculum';

const TILE_SIZE = 48; 
const VISIBLE_WIDTH_PX = 800;
const VISIBLE_HEIGHT_PX = 600;

// Initial NPCs (Names will be reused)
const NPC_NAMES = ['Bu Ani', 'Pak Budi', 'Bu Citra', 'Pak Dedi', 'Bu Eka', 'Kepsek', 'Pak Feri', 'Bu Gina', 'Pak Hari', 'Bu Indah', 'Pak Joko', 'Bu Kiki'];

interface AdventureGameProps {
  userData: UserData;
  mode: 'solo' | 'coop' | 'duel';
  onExit: () => void;
}

interface ActiveQuestionState {
    npcId: number;
    q: string;
    options: string[];
    correctAnswer: string;
}

/**
 * Komponen utama untuk permainan petualangan (Adventure Game).
 * Pemain menjelajahi peta, berinteraksi dengan NPC, dan menjawab pertanyaan matematika.
 * Mendukung mode solo, kooperatif (coop), dan duel.
 * 
 * @param {AdventureGameProps} props - Properti komponen AdventureGame.
 * @param {UserData} props.userData - Data pengguna yang sedang bermain.
 * @param {'solo' | 'coop' | 'duel'} props.mode - Mode permainan yang dipilih.
 * @param {() => void} props.onExit - Callback untuk keluar dari permainan.
 * @returns {JSX.Element} Elemen antarmuka permainan petualangan.
 */
export const AdventureGame: React.FC<AdventureGameProps> = ({ userData, mode, onExit }) => {
  const { showToast } = useAppContext(); 
  
  // Game States
  const [gameState, setGameState] = useState<'initializing' | 'lobby' | 'playing' | 'question' | 'won' | 'gameover'>('initializing');
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(180); 
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestionState | null>(null);
  
  // Dynamic Content State
  const [generatedMapLayout, setGeneratedMapLayout] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, unknown>[]>([]);

  // Visual Effects States
  const [isShaking, setIsShaking] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [showExitConfirm, setShowExitConfirm] = useState(false); 
  
  // Multiplayer States
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [lobbyStatus, setLobbyStatus] = useState<'idle' | 'creating' | 'joining' | 'waiting'>('idle');
  const [opponentPos, setOpponentPos] = useState<Position | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const hasUpdatedRef = useRef(false); 

  /**
   * Mengonversi layout peta dari array string menjadi array 2D angka (0 untuk lantai, 1 untuk dinding).
   * @param {string[]} layout - Array string yang merepresentasikan peta.
   * @returns {AdventureTileType[][]} Array 2D yang merepresentasikan logika peta.
   */
  const parseMapToBinary = (layout: string[]): AdventureTileType[][] => {
    return layout.map(row => row.split('').map(char => {
        return char === '#' ? 1 : 0; 
    }));
  };

  // --- USE CUSTOM HOOK ---
  const {
      map, 
      setMap, 
      npcs, playerPos, hearts, 
      setPlayerPos, setNpcs,
      attemptMove, startMoveInterval, stopMoveInterval, 
      takeDamage, markNpcAsAnswered, checkNearbyNpc
  } = useAdventureGame({
      initialMap: [[0]], 
      initialNpcs: [],
      onGameOver: () => setGameState('gameover'),
      onNotification: (msg, type) => showToast(msg, type)
  });

  // --- AI INITIALIZATION ---
  useEffect(() => {
    const initGameContent = async () => {
        setGameState('initializing');

        // Ambil topik yang sudah dipelajari
        const userTopics = getCompletedTopics(userData.completed_lessons);

        // 1. Generate Map & NPC Questions (Dengan Level Context)
        const [mapStrings, npcQuestions] = await Promise.all([
            generateAdventureMapAI(),
            generateAdventureQuestionsAI(userData.grade || '8', userTopics, userData.level || 1)
        ]);

        const logicMap = parseMapToBinary(mapStrings);
        setMap(logicMap);
        setGeneratedMapLayout(mapStrings); 

        // 2. Setup Logic Penempatan NPC (DISTRIBUTED)
        const floorPositions: Position[] = [];
        
        mapStrings.forEach((row, r) => {
            row.split('').forEach((char, c) => {
                if(char === '.') floorPositions.push({ row: r, col: c });
            });
        });

        // Tentukan Posisi Player (Cari area aman di kiri atas)
        // Cari lantai yang row+col nya kecil
        let startPos = { row: 1, col: 1 };
        const sortedFloors = [...floorPositions].sort((a, b) => (a.row + a.col) - (b.row + b.col));
        if (sortedFloors.length > 0) startPos = sortedFloors[Math.floor(Math.random() * Math.min(20, sortedFloors.length))]; // Ambil salah satu dari 20 lantai terdekat pojok kiri atas
        
        setPlayerPos(startPos);

        // Penempatan NPC dengan Jarak Minimal (Euclidean Distance)
        const newNpcs: NPC[] = [];
        const MIN_NPC_DISTANCE = 10; // Jarak minimal antar NPC (blok)
        const TARGET_NPC_COUNT = 10;
        
        // Shuffle semua kemungkinan lantai
        const shuffledFloors = floorPositions.sort(() => 0.5 - Math.random());
        
        for(const pos of shuffledFloors) {
            if(newNpcs.length >= TARGET_NPC_COUNT) break;

            // Jangan taruh di dekat player start
            const distToStart = Math.sqrt(Math.pow(pos.row - startPos.row, 2) + Math.pow(pos.col - startPos.col, 2));
            if(distToStart < 8) continue;

            // Cek jarak dengan NPC lain yang sudah ditaruh
            let tooClose = false;
            for(const existing of newNpcs) {
                const dist = Math.sqrt(Math.pow(pos.row - existing.row, 2) + Math.pow(pos.col - existing.col, 2));
                if(dist < MIN_NPC_DISTANCE) {
                    tooClose = true;
                    break;
                }
            }

            if(!tooClose) {
                newNpcs.push({
                    id: newNpcs.length + 1,
                    row: pos.row, col: pos.col,
                    name: NPC_NAMES[newNpcs.length % NPC_NAMES.length],
                    isAnswered: false
                });
            }
        }

        setGeneratedQuestions(npcQuestions);
        setNpcs(newNpcs);

        if (mode === 'solo') {
            setGameState('playing');
            setTimeout(() => containerRef.current?.focus(), 500);
        } else {
            setGameState('lobby');
        }
    };
    
    initGameContent();

    const handleResize = () => {
        const w = Math.min(window.innerWidth, VISIBLE_WIDTH_PX);
        const h = Math.min(window.innerHeight, VISIBLE_HEIGHT_PX);
        setViewportSize({ w, h });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        cleanupChannel();
        stopMoveInterval();
    };
  }, [mode]);

  // --- TIMER ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) { setGameState('won'); return 0; }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // --- MULTIPLAYER LOGIC ---
  /**
   * Membersihkan channel Supabase saat keluar dari mode multiplayer.
   */
  const cleanupChannel = () => { 
      if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
      }
  };

  /**
   * Memperbarui skor pemain di database untuk mode multiplayer.
   * @param {number} newScore - Skor baru yang akan disimpan.
   */
  const updateScoreInDb = async (newScore: number) => {
     const role = roomCode === joinCode ? 'p2' : 'p1'; 
     const updateData = role === 'p1' ? { score_p1: newScore } : { score_p2: newScore };
     await supabase.from('game_rooms').update(updateData).eq('code', roomCode);
     channelRef.current?.send({ type: 'broadcast', event: 'score_update', payload: { score: newScore } });
  };

  /**
   * Berlangganan ke channel Supabase untuk sinkronisasi state multiplayer.
   * @param {string} code - Kode room.
   * @param {'p1' | 'p2'} myRole - Peran pemain (p1 atau p2).
   */
  const subscribeToRoom = (code: string, myRole: 'p1' | 'p2') => {
      cleanupChannel();
      const channel = supabase.channel(`school_${code}`, { config: { broadcast: { self: false } } });
      
      channel
        .on('broadcast', { event: 'player_move' }, ({ payload }) => setOpponentPos(payload.pos))
        .on('broadcast', { event: 'score_update' }, ({ payload }) => setOpponentScore(payload.score))
        .on('broadcast', { event: 'npc_cleared' }, ({ payload }) => {
            if (mode === 'coop') markNpcAsAnswered(payload.npcId);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `code=eq.${code}` }, (payload: Record<string, unknown>) => {
             const newPayload = payload.new as any;
             if (newPayload.status === 'playing' && myRole === 'p1') { 
                 setGameState('playing'); 
                 showToast(`${newPayload.player_2_name} bergabung!`, 'success');
             }
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') setIsConnected(true);
        });
      
      channelRef.current = channel;
  };

  /**
   * Membuat room baru untuk mode multiplayer.
   */
  const createRoom = async () => {
      setLobbyStatus('creating');
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      try {
        const { error } = await supabase.from('game_rooms').insert({ 
            code, created_by: userData.id, game_type: 'adventure', 
            player_1_id: userData.id, player_1_name: userData.username, 
            mode, status: 'waiting' 
        });
        if (error) throw error;
        setRoomCode(code); 
        setLobbyStatus('waiting'); 
        subscribeToRoom(code, 'p1');
      } catch (e: unknown) {
        showToast("Gagal membuat room.", 'error');
        setLobbyStatus('idle');
      }
  };

  /**
   * Bergabung ke room multiplayer yang sudah ada menggunakan kode.
   */
  const joinRoom = async () => {
      if (joinCode.length !== 4) return showToast("Kode room harus 4 karakter", 'error');
      setLobbyStatus('joining');
      try {
        const { data: room, error } = await supabase.from('game_rooms')
            .select('*').eq('code', joinCode.toUpperCase()).eq('game_type', 'adventure').single();
            
        if (error || !room) throw new Error("Room Adventure tidak ditemukan");
        if (room.status !== 'waiting') throw new Error("Game penuh/berjalan");

        await supabase.from('game_rooms').update({ 
            player_2_id: userData.id, player_2_name: userData.username, status: 'playing' 
        }).eq('code', joinCode.toUpperCase());

        setRoomCode(joinCode.toUpperCase()); 
        subscribeToRoom(joinCode.toUpperCase(), 'p2'); 
        setGameState('playing');
      } catch (e: unknown) {
         const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
         showToast(msg, 'error');
         setLobbyStatus('idle');
      }
  };

  // --- GAME CONTROLS ---
  
  /**
   * Menangani pergerakan pemain menggunakan joystick virtual.
   * @param {{x: number, y: number}} vec - Vektor arah pergerakan.
   */
  const handleJoystickMove = (vec: {x: number, y: number}) => {
      if (gameState !== 'playing') return;
      startMoveInterval(vec, (newPos) => {
          if (mode !== 'solo' && channelRef.current) {
              channelRef.current.send({ type: 'broadcast', event: 'player_move', payload: { pos: newPos } });
          }
      });
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (gameState !== 'playing') return;
          
          const handleMove = (dr: number, dc: number) => {
              attemptMove(dr, dc, (newPos) => {
                 if (mode !== 'solo' && channelRef.current) {
                    channelRef.current.send({ type: 'broadcast', event: 'player_move', payload: { pos: newPos } });
                 }
              });
          }

          switch(e.key.toLowerCase()) {
              case 'arrowup': case 'w': handleMove(-1, 0); break;
              case 'arrowdown': case 's': handleMove(1, 0); break;
              case 'arrowleft': case 'a': handleMove(0, -1); break;
              case 'arrowright': case 'd': handleMove(0, 1); break;
              case 'enter': handleInteract(); break;
          }
      };
      
      // Attach to window to ensure we catch events even if focus is lost momentarily
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, attemptMove]); 

  // --- INTERACTION ---
  const nearbyNpc = checkNearbyNpc();

  /**
   * Menangani interaksi dengan NPC terdekat untuk memulai pertanyaan.
   */
  const handleInteract = () => {
      if (nearbyNpc) {
          const randomQ = generatedQuestions[Math.floor(Math.random() * generatedQuestions.length)];
          const fallbackQ = { q: "1 + 1 = ?", opts: ["2", "3", "4", "5"], ans: "2" };
          const qData = randomQ || fallbackQ;
          
          setActiveQuestion({ 
              npcId: nearbyNpc.id, 
              q: String(qData.q), 
              correctAnswer: String(qData.ans), 
              options: Array.isArray(qData.opts) ? qData.opts.map(String) : [] 
          });
          setGameState('question'); 
          stopMoveInterval();
      }
  };

  /**
   * Memeriksa jawaban yang dipilih pemain untuk pertanyaan NPC.
   * @param {string} ansVal - Jawaban yang dipilih.
   */
  const handleAnswer = (ansVal: string) => {
      if (!activeQuestion) return;
      const isCorrect = ansVal === activeQuestion.correctAnswer;

      markNpcAsAnswered(activeQuestion.npcId);
      if (mode === 'coop' && channelRef.current) {
          channelRef.current.send({ type: 'broadcast', event: 'npc_cleared', payload: { npcId: activeQuestion.npcId } });
      }

      if (isCorrect) {
          const newScore = score + 100;
          setScore(newScore);
          showToast("Jawaban Benar! +100 XP", "success");
          if (mode !== 'solo') updateScoreInDb(newScore);
          setGameState('playing');
      } else {
          setIsShaking(true); setDamageFlash(true); setTimeout(() => { setIsShaking(false); setDamageFlash(false); }, 500);
          showToast("Jawaban Salah!", "error");
          takeDamage(); 
          if (hearts > 1) setGameState('playing'); 
      }
      setActiveQuestion(null);
  };

  // --- FINISH LOGIC ---
  useEffect(() => {
    const concludeGame = async () => {
        if ((gameState === 'won' || gameState === 'gameover') && !hasUpdatedRef.current) {
            hasUpdatedRef.current = true;
            let finalGameScore = score;
            const heartBonus = hearts * 20; 
            let duelBonus = 0;
            if (mode === 'coop') { finalGameScore = score + opponentScore; } 
            else if (mode === 'duel') { if (score > opponentScore) { duelBonus = 50; } }
            const totalEarned = Math.max(0, finalGameScore + heartBonus + duelBonus);
            setEarnedXp(totalEarned);
        }
    };
    concludeGame();
  }, [gameState, score, hearts, opponentScore, mode]);

  // --- HANDLE EXIT ---
  /**
   * Menampilkan modal konfirmasi keluar permainan.
   */
  const handleExitClick = () => {
      stopMoveInterval();
      setShowExitConfirm(true);
  };

  /**
   * Mengonfirmasi keluar permainan dan memanggil callback onExit.
   */
  const confirmExit = () => {
      cleanupChannel();
      stopMoveInterval();
      onExit();
  };

  /**
   * Membatalkan keluar permainan dan menutup modal konfirmasi.
   */
  const cancelExit = () => {
      setShowExitConfirm(false);
      if (gameState === 'playing') containerRef.current?.focus();
  };


  // --- RENDER HELPERS ---
  const MAP_ROWS = generatedMapLayout.length || 1;
  const MAP_COLS = generatedMapLayout[0]?.length || 1;
  
  const maxCamX = (MAP_COLS * TILE_SIZE) - viewportSize.w;
  const maxCamY = (MAP_ROWS * TILE_SIZE) - viewportSize.h;
  let camX = (playerPos.col * TILE_SIZE) + (TILE_SIZE / 2) - (viewportSize.w / 2);
  let camY = (playerPos.row * TILE_SIZE) + (TILE_SIZE / 2) - (viewportSize.h / 2);
  camX = Math.max(0, Math.min(camX, maxCamX));
  camY = Math.max(0, Math.min(camY, maxCamY));
  
  if (gameState === 'initializing') {
      return (
          <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-white text-center">
              <Sparkles className="animate-spin mb-4 text-fox" size={48} />
              <h2 className="text-2xl font-bold mb-2">Logi Sedang Membangun Sekolah...</h2>
              <p className="text-slate-400">AI sedang menyusun peta luas (40x60) dan menyebar NPC (Level {userData.level}).</p>
          </div>
      );
  }

  // --- LOBBY UI ---
  if (gameState === 'lobby' && mode !== 'solo') {
      return (
          <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl border-4 border-slate-200 relative">
                  <button onClick={() => { cleanupChannel(); onExit(); }} className="absolute top-4 right-4 text-slate-400"><X /></button>
                  
                  <div className="absolute top-4 left-4">
                      {isConnected ? 
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full"><Wifi size={14} /> ONLINE</div> : 
                        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full animate-pulse"><WifiOff size={14} /> CONNECTING...</div>
                      }
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-700 mb-2">Lobby {mode === 'coop' ? 'Kelompok' : 'Duel'}</h2>
                  {lobbyStatus === 'idle' && (
                      <div className="space-y-4 mt-6">
                          <Button onClick={createRoom} className="w-full bg-fox border-fox-dark" size="lg" icon={<Play size={24}/>}>BUAT ROOM</Button>
                          <div className="flex gap-2">
                             <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} className="border-2 border-slate-200 bg-slate-100 p-2 rounded-2xl flex-1 text-center font-extrabold text-xl uppercase" placeholder="KODE" maxLength={4} />
                             <Button onClick={joinRoom} variant="secondary">GABUNG</Button>
                          </div>
                      </div>
                  )}
                  {(lobbyStatus === 'waiting' || lobbyStatus === 'creating') && (
                      <div className="space-y-6 mt-6">
                          <div className="bg-fox-light/20 p-6 rounded-2xl border-2 border-fox border-dashed">
                              <p className="text-slate-500 font-bold text-sm mb-2">KODE ROOM:</p>
                              <div className="text-5xl font-mono font-extrabold text-slate-800 tracking-widest">{roomCode || '...'}</div>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold"><Loader2 className="animate-spin"/> Menunggu pemain 2...</div>
                          <Button onClick={() => { cleanupChannel(); setLobbyStatus('idle'); }} variant="ghost" size="sm">Batal</Button>
                      </div>
                  )}
                  {lobbyStatus === 'joining' && <div className="py-8"><Loader2 className="animate-spin mx-auto text-fox" size={48}/></div>}
              </div>
          </div>
      );
  }

  // --- GAME UI ---
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center font-sans overflow-hidden z-[100]" ref={containerRef} tabIndex={0}>
        
        {/* UNIFIED HUD */}
        <GameHUD 
            onExit={handleExitClick}
            hearts={hearts}
            score={score}
            timeLeft={timeLeft}
            mode={mode}
            opponentScore={opponentScore}
            isShaking={isShaking}
        />

        {/* VIEWPORT */}
        <div className={`relative overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 ${isShaking ? 'border-4 border-cardinal' : ''}`} style={{ width: viewportSize.w, height: viewportSize.h }}>
            <div className={`absolute inset-0 bg-red-500/30 z-40 pointer-events-none transition-opacity duration-200 ${damageFlash ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="absolute top-0 left-0 transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translate3d(${-camX}px, ${-camY}px, 0)` }}>
                {/* MAP RENDER */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAP_COLS}, ${TILE_SIZE}px)`, gridTemplateRows: `repeat(${MAP_ROWS}, ${TILE_SIZE}px)`, width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE }}>
                    {generatedMapLayout.map((rowStr, r) => rowStr.split('').map((char, c) => {
                        let bgClass = "bg-slate-900"; 
                        if (char === '.') bgClass = "bg-slate-800"; 
                        if (char === '#') bgClass = "bg-slate-900"; 
                        return (
                            <div key={`${r}-${c}`} className={`relative ${bgClass} flex items-center justify-center`}>
                                {char === '.' && <div className="w-1.5 h-1.5 bg-slate-700 rounded-full opacity-50"></div>}
                                {char === '#' && <div className="absolute inset-1 bg-blue-900/50 border-2 border-blue-500 rounded-md shadow-sm z-10"></div>}
                            </div>
                        );
                    }))}
                </div>

                {/* NPCs */}
                {npcs.map(npc => !npc.isAnswered && (
                    <div key={npc.id} className="absolute z-20 flex flex-col items-center justify-center transition-all duration-300" style={{ left: npc.col * TILE_SIZE, top: npc.row * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                        <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce ${nearbyNpc?.id === npc.id ? 'bg-macaw scale-110' : 'bg-fox'}`}>
                            <span className="font-bold text-white text-xs">{npc.name[0]}</span>
                        </div>
                        <div className="bg-slate-800/80 text-white text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold whitespace-nowrap backdrop-blur-sm">{npc.name}</div>
                        {nearbyNpc?.id === npc.id && ( <div className="absolute -top-8 bg-white text-slate-800 p-1.5 rounded-xl shadow-xl border-2 border-slate-100 animate-in zoom-in"><MessageCircle size={20} className="text-macaw"/></div> )}
                    </div>
                ))}

                {/* Opponent */}
                {opponentPos && (
                    <div className="absolute z-20 flex items-center justify-center transition-all duration-300 ease-linear opacity-60 grayscale" style={{ left: opponentPos.col * TILE_SIZE, top: opponentPos.row * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                         <div className="w-10 h-10 bg-slate-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                )}

                {/* Player */}
                <div className="absolute z-30 flex items-center justify-center transition-all duration-300 ease-out" style={{ left: playerPos.col * TILE_SIZE, top: playerPos.row * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                    <div className="relative transform scale-125 drop-shadow-2xl -mt-4">
                        <Avatar config={userData.avatar_config} size={44} className="bg-white" />
                        <div className="absolute -bottom-1 left-1 right-1 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
                    </div>
                </div>
            </div>
        </div>

        <Joystick onMove={handleJoystickMove} onStop={stopMoveInterval} />

        {/* INTERACTION BUTTON */}
        {nearbyNpc && (
            <div className="absolute bottom-32 right-8 md:bottom-10 md:right-1/2 md:translate-x-1/2 z-[120] animate-in slide-in-from-bottom-4">
                 <button onClick={handleInteract} className="bg-macaw hover:bg-macaw-light text-white px-8 py-4 rounded-2xl shadow-xl font-black text-xl flex items-center gap-3 border-b-8 border-macaw-dark active:border-b-0 active:translate-y-2 transition-all">
                    <MessageCircle size={28} strokeWidth={3} /> JAWAB SOAL
                 </button>
            </div>
        )}

        {/* QUESTION MODAL */}
        {activeQuestion && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-white p-6 rounded-3xl w-full max-w-sm text-center shadow-2xl border-b-8 border-slate-200">
                    <h3 className="text-slate-400 font-extrabold text-xs uppercase mb-4 tracking-widest">Tantangan Matematika</h3>
                    <div className="text-lg font-bold text-slate-800 py-6 border-2 border-slate-100 rounded-2xl bg-slate-50 mb-6 px-4">{activeQuestion.q}</div>
                    <div className="grid grid-cols-2 gap-3">
                        {activeQuestion.options.map((opt, i) => (
                            <button key={i} onClick={() => handleAnswer(opt)} className="bg-white border-2 border-b-4 border-slate-200 p-4 rounded-xl font-bold text-lg hover:bg-sky-50 hover:text-macaw hover:border-macaw active:border-b-2 active:translate-y-1 transition-all text-slate-600">{opt}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}

         {/* CONFIRM EXIT MODAL */}
         {showExitConfirm && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cardinal">
                        <LogOut size={32} />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2">Keluar Petualangan?</h3>
                    <p className="text-slate-500 font-bold mb-6">Progres permainanmu saat ini akan hilang.</p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={cancelExit}>BATAL</Button>
                        <Button variant="danger" className="flex-1" onClick={confirmExit}>YA, KELUAR</Button>
                    </div>
                </div>
            </div>
        )}

        {/* END SCREEN */}
        {(gameState === 'won' || gameState === 'gameover') && (
            <div className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl p-6 text-center animate-in zoom-in">
                 {gameState === 'won' ? <div className="bg-green-100 p-6 rounded-full mb-6"><Trophy size={80} className="text-feather" fill="currentColor" /></div> : <div className="bg-red-100 p-6 rounded-full mb-6"><AlertCircle size={80} className="text-cardinal" /></div>}
                 <h1 className="text-4xl font-black text-slate-800 mb-2">{gameState === 'won' ? 'MISI SELESAI!' : 'GAME OVER'}</h1>
                 <p className="text-slate-500 font-bold text-lg mb-8">{gameState === 'won' ? `Kamu hebat! Total XP: +${earnedXp}` : 'Yah, kesempatanmu habis.'}</p>
                 <Button size="lg" onClick={() => { cleanupChannel(); onExit(); }}>KELUAR PERMAINAN</Button>
            </div>
        )}
    </div>
  );
};