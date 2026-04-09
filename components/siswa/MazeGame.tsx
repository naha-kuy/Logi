import React, { useState, useEffect, useRef } from 'react';
import { CellType, Position } from '../../types';
import { Avatar } from '../shared/Avatar';
import { Button } from '../shared/Button';
import { Joystick } from '../shared/Joystick'; 
import { GameHUD } from '../shared/GameHUD'; 
import { Lock, CheckCircle, XCircle, Flag, Loader2, Wifi, WifiOff, Sparkles, LogOut, Play } from 'lucide-react'; 
import { supabase, UserData } from '../../lib/supabase';
import { useMazeGame } from '../../hooks/useMazeGame';
import { useAppContext } from '../../lib/AppContext'; 
import { generateMazeMapAI, generateMazeQuestionsAI } from '../../services/gemini';
import { getCompletedTopics } from '../../data/curriculum';

const TILE_SIZE = 48; 

// Initial Placeholder (akan ditimpa AI/Algo)
const INITIAL_MAP_PLACEHOLDER: CellType[][] = [[1]];

interface MazeGameProps {
  userData: UserData;
  mode: 'solo' | 'coop' | 'duel';
  onExit: () => void;
}

/**
 * Komponen utama untuk permainan labirin (Maze Game).
 * Mendukung mode solo, kooperatif (coop), dan duel.
 * Permainan ini menghasilkan labirin dan pertanyaan secara dinamis menggunakan AI.
 * 
 * @param {MazeGameProps} props - Properti komponen MazeGame.
 * @param {UserData} props.userData - Data pengguna yang sedang bermain.
 * @param {'solo' | 'coop' | 'duel'} props.mode - Mode permainan yang dipilih.
 * @param {() => void} props.onExit - Callback untuk keluar dari permainan.
 * @returns {JSX.Element} Elemen antarmuka permainan labirin.
 */
export const MazeGame: React.FC<MazeGameProps> = ({ userData, mode, onExit }) => {
  const { showToast } = useAppContext();
  const [gameState, setGameState] = useState<'initializing' | 'lobby' | 'playing' | 'question' | 'won' | 'gameover'>('initializing');
  const [score, setScore] = useState(0); 
  const [earnedXp, setEarnedXp] = useState(0); 
  const hasUpdatedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 350, h: 350 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Dynamic Content State
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  
  // Quiz State
  const [activeObstacle, setActiveObstacle] = useState<{pos: Position, data: Record<string, unknown>} | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Multiplayer State
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [lobbyStatus, setLobbyStatus] = useState<'idle' | 'creating' | 'joining' | 'waiting'>('idle');
  const [opponentPos, setOpponentPos] = useState<Position | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // --- USE CUSTOM HOOK ---
  const { 
    map, playerPos, hearts, setMap, initPlayer, 
    startMoveInterval, stopMoveInterval, takeDamage, unlockDoor, attemptMove 
  } = useMazeGame({
    initialMap: INITIAL_MAP_PLACEHOLDER,
    onWin: () => setGameState('won'),
    onGameOver: () => setGameState('gameover'),
    onDoorEncounter: (pos) => {
        stopMoveInterval();
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        setActiveObstacle({ pos, data: randomQ });
        setGameState('question');
    },
    onNotification: (msg, type) => showToast(msg, type) 
  });

  // --- AI INITIALIZATION ---
  useEffect(() => {
    const initGameContent = async () => {
      setGameState('initializing');
      
      // Ambil topik yang sudah dipelajari
      const userTopics = getCompletedTopics(userData.completed_lessons);

      // 1. Generate Map & Questions (Dengan Level Context)
      const [aiMap, aiQuestions] = await Promise.all([
        generateMazeMapAI(),
        generateMazeQuestionsAI(userData.grade || '8', userTopics, userData.level || 1)
      ]);

      setMap(aiMap);
      setQuestions(aiQuestions);
      
      // Hack: Wait for state update before init player
      setTimeout(() => {
        let startPos = { row: 1, col: 1 };
        for(let r=0; r<aiMap.length; r++) {
            for(let c=0; c<aiMap[0].length; c++) {
                if(aiMap[r][c] === 4) startPos = {row: r, col: c};
            }
        }
      }, 100);

      if (mode === 'solo') {
        setGameState('playing');
        setTimeout(() => containerRef.current?.focus(), 100);
      } else {
        setGameState('lobby');
      }
    };

    initGameContent();

    const handleResize = () => {
      const w = Math.min(window.innerWidth, 800);
      const h = Math.min(window.innerHeight, 600);
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

  // Re-trigger player init when map changes
  useEffect(() => {
      if (map.length > 1) initPlayer();
  }, [map, initPlayer]);

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
   * Berlangganan ke channel Supabase untuk sinkronisasi state multiplayer.
   * @param {string} code - Kode room.
   * @param {'p1' | 'p2'} myRole - Peran pemain (p1 atau p2).
   */
  const subscribeToRoom = (code: string, myRole: 'p1' | 'p2') => {
    cleanupChannel();
    const channel = supabase.channel(`room_${code}`, { config: { broadcast: { self: false } } });
    
    channel
      .on('broadcast', { event: 'player_move' }, ({ payload }) => { setOpponentPos(payload.pos); })
      .on('broadcast', { event: 'door_unlock' }, ({ payload }) => {
        if (mode === 'coop') {
          setMap(prev => {
            const newMap = [...prev.map(r => [...r])]; 
            newMap[payload.r][payload.c] = 5; 
            return newMap;
          });
          showToast("Temanmu membuka pintu!", 'info');
        }
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
        code, created_by: userData.id, game_type: 'maze', 
        player_1_id: userData.id, player_1_name: userData.username, 
        mode: mode, status: 'waiting'
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
        .select('*').eq('code', joinCode.toUpperCase()).eq('game_type', 'maze').single();

      if (error || !room) throw new Error("Room Maze tidak ditemukan");
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

  useEffect(() => {
      if (mode !== 'solo' && channelRef.current && gameState === 'playing') {
          channelRef.current.send({ type: 'broadcast', event: 'player_move', payload: { pos: playerPos } });
      }
  }, [playerPos, mode, gameState]);

  // --- KEYBOARD CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch(e.key) {
        case 'ArrowUp': case 'w': attemptMove(-1, 0); break;
        case 'ArrowDown': case 's': attemptMove(1, 0); break;
        case 'ArrowLeft': case 'a': attemptMove(0, -1); break;
        case 'ArrowRight': case 'd': attemptMove(0, 1); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [attemptMove, gameState]);

  // --- QUIZ HANDLER ---
  /**
   * Memeriksa jawaban yang dipilih pemain untuk pertanyaan rintangan.
   * Membuka pintu jika jawaban benar, atau mengurangi nyawa jika salah.
   * @param {number} index - Indeks jawaban yang dipilih.
   */
  const handleAnswer = (index: number) => {
    if (!activeObstacle) return;
    const IS_CORRECT = index === activeObstacle.data.ans; 
    setSelectedAnswer(index);
    
    if (IS_CORRECT) {
      showToast("Benar! +50 XP", 'success');
      setTimeout(() => {
        if (activeObstacle) {
          unlockDoor(activeObstacle.pos);
          setScore(s => s + 50); // Consistent scoring
          if (mode !== 'solo') {
             channelRef.current?.send({ type: 'broadcast', event: 'door_unlock', payload: { r: activeObstacle.pos.row, c: activeObstacle.pos.col } });
          }
        }
        setGameState('playing');
        setSelectedAnswer(null); setActiveObstacle(null);
      }, 800);
    } else {
      takeDamage(); 
      setTimeout(() => {
        if (hearts > 1) setGameState('playing');
        setSelectedAnswer(null); setActiveObstacle(null);
      }, 800);
    }
  };

  // --- GAME END ---
  useEffect(() => {
    const concludeGame = async () => {
        if ((gameState === 'won' || gameState === 'gameover') && !hasUpdatedRef.current) {
            hasUpdatedRef.current = true;
            stopMoveInterval(); 
            const totalEarned = score + (gameState === 'won' ? 100 : 0) + (hearts * 30);
            setEarnedXp(totalEarned);
        }
    };
    concludeGame();
  }, [gameState, score, hearts]);

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
  const cameraX = (playerPos.col * TILE_SIZE) + (TILE_SIZE / 2) - (viewportSize.w / 2);
  const cameraY = (playerPos.row * TILE_SIZE) + (TILE_SIZE / 2) - (viewportSize.h / 2);
  
  if (gameState === 'initializing') {
      return (
          <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-6 text-white text-center">
              <Sparkles className="animate-spin mb-4 text-bee" size={48} />
              <h2 className="text-2xl font-bold mb-2">Logi Membangun Labirin...</h2>
              <p className="text-slate-400">Sedang menyusun tembok dan menyiapkan kunci jawaban (Level {userData.level}).</p>
          </div>
      );
  }

  if (gameState === 'lobby' && mode !== 'solo') {
     return (
       <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl border-4 border-slate-200 relative">
              <button onClick={() => onExit()} className="absolute top-4 right-4 text-slate-400"><XCircle /></button>
              
              <div className="absolute top-4 left-4">
                  {isConnected ? 
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full"><Wifi size={14} /> ONLINE</div> : 
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full animate-pulse"><WifiOff size={14} /> CONNECTING...</div>
                  }
              </div>

              <h2 className="text-2xl font-extrabold text-slate-700 mb-2">Lobby {mode === 'coop' ? 'Kelompok' : 'Duel'}</h2>
              {lobbyStatus === 'idle' && (
                <div className="space-y-4 mt-6">
                   <Button onClick={createRoom} className="w-full bg-bee border-bee-dark text-slate-800" size="lg" icon={<Play size={24}/>}>BUAT ROOM</Button>
                   <div className="flex gap-2">
                      <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="KODE" className="flex-1 bg-slate-100 border-2 rounded-2xl px-4 font-bold text-center text-xl uppercase" maxLength={4}/>
                      <Button onClick={joinRoom} variant="secondary">GABUNG</Button>
                   </div>
                </div>
              )}
              {(lobbyStatus === 'waiting' || lobbyStatus === 'creating') && (
                 <div className="space-y-6 mt-6">
                    <div className="bg-bee-light/20 p-6 rounded-2xl border-2 border-bee border-dashed">
                       <p className="text-slate-500 font-bold text-sm mb-2">KODE ROOM:</p>
                       <div className="text-5xl font-mono font-extrabold text-slate-800 tracking-widest">{roomCode || '...'}</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-500 font-bold"><Loader2 className="animate-spin" /> Menunggu pemain 2...</div>
                    <Button onClick={() => { cleanupChannel(); setLobbyStatus('idle'); }} variant="ghost" size="sm">Batal</Button>
                 </div>
              )}
              {lobbyStatus === 'joining' && <div className="py-8"><Loader2 className="animate-spin mx-auto text-macaw" size={48}/></div>}
          </div>
       </div>
     )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center touch-none overflow-hidden outline-none" tabIndex={0}>
      
      {/* UNIFIED HUD */}
      <GameHUD 
        onExit={handleExitClick}
        hearts={hearts}
        score={score}
        mode={mode}
        // Maze tidak pakai timer di layar utama untuk saat ini, atau bisa ditambahkan nanti
      />

      {/* GAME VIEW */}
      <div className="relative overflow-hidden bg-slate-900 shadow-2xl border-4 border-slate-700 rounded-xl" style={{ width: viewportSize.w, height: viewportSize.h }}>
        <div className="absolute top-0 left-0 transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${map[0].length}, ${TILE_SIZE}px)`, gridTemplateRows: `repeat(${map.length}, ${TILE_SIZE}px)` }}>
            {map.map((row, r) => row.map((tile, c) => {
                let bgClass = "bg-slate-900"; 
                if (tile === 0 || tile === 5) bgClass = "bg-slate-800"; 
                if (tile === 2) bgClass = "bg-slate-800 border-2 border-slate-700/50"; 
                return (
                  <div key={`${r}-${c}`} className={`relative ${bgClass} flex items-center justify-center`}>
                    {tile === 0 && <div className="w-1.5 h-1.5 bg-slate-700 rounded-full opacity-50"></div>}
                    {tile === 1 && (<div className="absolute inset-1 bg-blue-900/50 border-2 border-blue-500 rounded-md shadow-sm z-10"></div>)}
                    {tile === 2 && (<div className="w-10 h-10 bg-cardinal rounded-xl border-b-4 border-cardinal-dark flex items-center justify-center shadow-lg z-10 animate-bounce"><Lock className="text-white" size={20} /></div>)}
                    {tile === 3 && (<div className="w-10 h-10 bg-feather rounded-xl border-b-4 border-feather-dark flex items-center justify-center shadow-lg z-10 animate-bounce"><Flag className="text-white" size={24} fill="currentColor" /></div>)}
                    {tile === 5 && (<div className="w-10 h-10 bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-500 flex items-center justify-center"><div className="w-2 h-2 bg-feather rounded-full"></div></div>)}
                  </div>
                );
            }))}
          </div>
          {opponentPos && (
             <div className="absolute z-20 flex items-center justify-center opacity-60 grayscale transition-all duration-300"
                style={{ top: opponentPos.row * TILE_SIZE, left: opponentPos.col * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                <div className="w-10 h-10 bg-slate-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
             </div>
          )}
          <div className="absolute z-30 transition-all duration-200 ease-out flex items-center justify-center"
            style={{ top: playerPos.row * TILE_SIZE, left: playerPos.col * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
             <div className="relative -mt-4 transform scale-125 drop-shadow-2xl">
                <Avatar config={userData.avatar_config} size={40} className="bg-white" />
             </div>
          </div>
        </div>
      </div>

      {/* QUIZ MODAL */}
      {gameState === 'question' && activeObstacle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white rounded-2xl w-full max-w-[300px] p-4 shadow-2xl border-4 border-bee">
            <div className="text-center mb-4">
              <h3 className="text-bee-dark font-extrabold text-xs uppercase mb-2">Tantangan Cepat</h3>
              <div className="text-3xl font-extrabold text-slate-700 py-4 border-2 border-slate-100 rounded-xl bg-slate-50">{String(activeObstacle.data.q)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.isArray(activeObstacle.data.opts) && activeObstacle.data.opts.map((opt: unknown, idx: number) => (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={selectedAnswer !== null}
                    className={`p-3 rounded-xl border-b-4 font-bold text-lg transition-all ${selectedAnswer === idx ? 'bg-macaw text-white border-macaw-dark' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {String(opt)}
                  </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXIT MODAL */}
      {showExitConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cardinal">
                      <LogOut size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">Keluar Permainan?</h3>
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
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl p-6 text-center animate-in fade-in zoom-in">
            {gameState === 'won' ? <CheckCircle size={80} className="text-feather mb-4" /> : <XCircle size={80} className="text-cardinal mb-4" />}
            <h2 className="text-3xl font-extrabold text-slate-700 mb-2">{gameState === 'won' ? 'Finish!' : 'Game Over!'}</h2>
            <p className="text-slate-500 font-bold mb-8">{gameState === 'won' ? `Total XP: +${earnedXp}` : 'Coba lagi!'}</p>
            <Button size="lg" onClick={() => { cleanupChannel(); stopMoveInterval(); onExit(); }} variant={gameState === 'won' ? 'primary' : 'danger'}>MENU UTAMA</Button>
        </div>
      )}

      <Joystick onMove={startMoveInterval} onStop={stopMoveInterval} />
    </div>
  );
};