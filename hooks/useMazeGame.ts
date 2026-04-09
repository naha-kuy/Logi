import { useState, useRef, useCallback } from 'react';
import { CellType, Position } from '../types';

interface UseMazeGameProps {
  initialMap: CellType[][];
  onWin: () => void;
  onGameOver: () => void;
  onDoorEncounter: (pos: Position) => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Hook kustom untuk mengelola logika permainan labirin (Maze Game).
 * Menangani state peta, posisi pemain, nyawa, pergerakan, dan interaksi dengan pintu.
 * 
 * @param {UseMazeGameProps} props - Properti untuk inisialisasi hook.
 * @param {CellType[][]} props.initialMap - Peta awal labirin (array 2D).
 * @param {() => void} props.onWin - Callback yang dipanggil saat pemain mencapai tujuan.
 * @param {() => void} props.onGameOver - Callback yang dipanggil saat nyawa pemain habis.
 * @param {(pos: Position) => void} props.onDoorEncounter - Callback yang dipanggil saat pemain menabrak pintu.
 * @param {(message: string, type: 'success' | 'error' | 'info') => void} [props.onNotification] - Callback opsional untuk menampilkan notifikasi.
 * @returns {Object} Objek yang berisi state dan fungsi untuk mengontrol permainan labirin.
 */
export const useMazeGame = ({ initialMap, onWin, onGameOver, onDoorEncounter, onNotification }: UseMazeGameProps) => {
  const [map, setMap] = useState<CellType[][]>(initialMap);
  const [playerPos, setPlayerPos] = useState<Position>({ row: 1, col: 1 });
  const [hearts, setHearts] = useState(3);
  const moveIntervalRef = useRef<any>(null);

  // Initialize Player Position
  const initPlayer = useCallback(() => {
    for(let r=0; r<initialMap.length; r++) {
      for(let c=0; c<initialMap[0].length; c++) {
        if(initialMap[r][c] === 4) {
          setPlayerPos({ row: r, col: c });
          return;
        }
      }
    }
  }, [initialMap]);

  const attemptMove = useCallback((dRow: number, dCol: number) => {
    setPlayerPos(prev => {
      const newRow = prev.row + dRow;
      const newCol = prev.col + dCol;

      if (newRow < 0 || newRow >= map.length || newCol < 0 || newCol >= map[0].length) return prev;
      
      const targetCell = map[newRow][newCol];

      if (targetCell === 1) return prev; // Wall
      
      if (targetCell === 2) {
        // Door logic
        onDoorEncounter({ row: newRow, col: newCol });
        return prev;
      }

      if (targetCell === 3) {
        onWin();
      }

      return { row: newRow, col: newCol };
    });
  }, [map, onWin, onDoorEncounter]);

  const startMoveInterval = (vec: {x: number, y: number}) => {
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    if (Math.abs(vec.x) < 0.3 && Math.abs(vec.y) < 0.3) return;

    const move = () => {
      if (Math.abs(vec.x) > Math.abs(vec.y)) {
        if (vec.x > 0.5) attemptMove(0, 1);
        else if (vec.x < -0.5) attemptMove(0, -1);
      } else {
        if (vec.y > 0.5) attemptMove(1, 0);
        else if (vec.y < -0.5) attemptMove(-1, 0);
      }
    };

    move(); // Instant move first
    moveIntervalRef.current = setInterval(move, 200);
  };

  const stopMoveInterval = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  const takeDamage = () => {
    setHearts(h => {
        const newVal = h - 1;
        if (newVal <= 0) onGameOver();
        else if (onNotification) onNotification("Nyawa berkurang!", 'error');
        return newVal;
    });
  };

  const unlockDoor = (pos: Position) => {
      setMap(prev => {
          const newMap = [...prev.map(r => [...r])];
          newMap[pos.row][pos.col] = 5; // Open door
          return newMap;
      });
      setPlayerPos(pos); // Move into door
  };

  return {
    map,
    playerPos,
    hearts,
    setMap,
    initPlayer,
    startMoveInterval,
    stopMoveInterval,
    takeDamage,
    unlockDoor,
    attemptMove // Exposed for keyboard listeners
  };
};