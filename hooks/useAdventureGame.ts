import { useState, useRef, useCallback } from 'react';
import { AdventureTileType, Position, NPC } from '../types';

interface UseAdventureGameProps {
  initialMap: AdventureTileType[][];
  initialNpcs: NPC[];
  onGameOver: () => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Hook kustom untuk mengelola logika permainan petualangan (Adventure Game).
 * Menangani state peta, NPC, posisi pemain, nyawa, dan pergerakan.
 * 
 * @param {UseAdventureGameProps} props - Properti untuk inisialisasi hook.
 * @param {AdventureTileType[][]} props.initialMap - Peta awal permainan (array 2D).
 * @param {NPC[]} props.initialNpcs - Daftar NPC awal.
 * @param {() => void} props.onGameOver - Callback yang dipanggil saat nyawa pemain habis.
 * @param {(message: string, type: 'success' | 'error' | 'info') => void} [props.onNotification] - Callback opsional untuk menampilkan notifikasi.
 * @returns {Object} Objek yang berisi state dan fungsi untuk mengontrol permainan.
 */
export const useAdventureGame = ({ initialMap, initialNpcs, onGameOver, onNotification }: UseAdventureGameProps) => {
  const [map, setMap] = useState<AdventureTileType[][]>(initialMap);
  const [npcs, setNpcs] = useState<NPC[]>(initialNpcs);
  const [playerPos, setPlayerPos] = useState<Position>({ row: 10, col: 19 }); // Default start pos
  const [hearts, setHearts] = useState(3);
  const moveIntervalRef = useRef<any>(null);

  const attemptMove = useCallback((dRow: number, dCol: number, broadcastCallback?: (pos: Position) => void) => {
    setPlayerPos(prev => {
        // Guard clause jika map belum siap
        if (!map || map.length === 0) return prev;

        const MAP_ROWS = map.length;
        const MAP_COLS = map[0].length;

        const newR = prev.row + dRow;
        const newC = prev.col + dCol;

        // Cek Boundary
        if (newR < 0 || newR >= MAP_ROWS || newC < 0 || newC >= MAP_COLS) return prev;
        
        // Cek Tembok (1 = Wall)
        // Pastikan kita mengakses index yang valid
        if (map[newR] && map[newR][newC] === 1) return prev;

        const newPos = { row: newR, col: newC };
        
        // Optional: Panggil callback untuk broadcast ke multiplayer
        if (broadcastCallback) {
            broadcastCallback(newPos);
        }

        return newPos;
    });
  }, [map]); // Dependency updated to include map changes

  const startMoveInterval = (vec: {x: number, y: number}, broadcastCallback?: (pos: Position) => void) => {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      if (vec.x === 0 && vec.y === 0) return;
      
      moveIntervalRef.current = setInterval(() => {
          if (Math.abs(vec.x) > Math.abs(vec.y)) {
              if (vec.x > 0.3) attemptMove(0, 1, broadcastCallback);
              else if (vec.x < -0.3) attemptMove(0, -1, broadcastCallback);
          } else {
              if (vec.y > 0.3) attemptMove(1, 0, broadcastCallback);
              else if (vec.y < -0.3) attemptMove(-1, 0, broadcastCallback);
          }
      }, 200);
  };

  const stopMoveInterval = () => {
      if (moveIntervalRef.current) { clearInterval(moveIntervalRef.current); moveIntervalRef.current = null; }
  };

  const takeDamage = () => {
    setHearts(h => { 
        const newVal = h - 1; 
        if (newVal <= 0) {
            onGameOver();
        } else if (onNotification) {
            onNotification("Nyawa berkurang!", 'error');
        }
        return newVal; 
    });
  };

  const markNpcAsAnswered = (npcId: number) => {
      setNpcs(prev => prev.map(n => n.id === npcId ? { ...n, isAnswered: true } : n));
  };

  const checkNearbyNpc = (): NPC | null => {
      return npcs.find(n => Math.abs(n.row - playerPos.row) <= 1.5 && Math.abs(n.col - playerPos.col) <= 1.5 && !n.isAnswered) || null;
  };

  return {
    map,
    setMap, // EXPOSED: Agar komponen bisa update peta logika
    npcs,
    playerPos,
    hearts,
    setPlayerPos, 
    setNpcs,      
    attemptMove,
    startMoveInterval,
    stopMoveInterval,
    takeDamage,
    markNpcAsAnswered,
    checkNearbyNpc
  };
};