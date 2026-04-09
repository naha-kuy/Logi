import React from 'react';
import { Heart, Clock, Star, X } from 'lucide-react';

interface GameHUDProps {
  onExit: () => void;
  hearts: number;
  maxHearts?: number;
  score: number;
  opponentScore?: number;
  mode: 'solo' | 'coop' | 'duel';
  timeLeft?: number; // Detik (Opsional, karena Maze mungkin tidak pakai timer visual)
  isShaking?: boolean; // Efek visual saat damage
}

/**
 * Komponen Heads-Up Display (HUD) untuk permainan.
 * Menampilkan informasi penting seperti nyawa, skor, waktu tersisa, dan tombol keluar.
 * 
 * @param {GameHUDProps} props - Properti komponen GameHUD.
 * @param {() => void} props.onExit - Fungsi yang dipanggil saat tombol keluar diklik.
 * @param {number} props.hearts - Jumlah nyawa pemain saat ini.
 * @param {number} [props.maxHearts=3] - Jumlah nyawa maksimal.
 * @param {number} props.score - Skor atau XP pemain saat ini.
 * @param {number} [props.opponentScore=0] - Skor lawan atau rekan tim (untuk mode coop/duel).
 * @param {'solo' | 'coop' | 'duel'} props.mode - Mode permainan saat ini.
 * @param {number} [props.timeLeft] - Waktu tersisa dalam detik (opsional).
 * @param {boolean} [props.isShaking=false] - Menandakan apakah HUD harus bergetar (misal saat menerima damage).
 * @returns {JSX.Element} Elemen HUD yang dirender.
 */
export const GameHUD: React.FC<GameHUDProps> = ({ 
  onExit, 
  hearts, 
  maxHearts = 3, 
  score, 
  opponentScore = 0,
  mode, 
  timeLeft, 
  isShaking = false 
}) => {
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-[50] pointer-events-none flex justify-between items-start">
      
      {/* KIRI: Tombol Keluar & Timer (Jika ada) */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        <div className="flex gap-2">
            <button 
                onClick={onExit} 
                className="bg-white p-2.5 rounded-2xl border-b-4 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-cardinal text-slate-400 transition-all shadow-sm active:border-b-0 active:translate-y-1"
                title="Keluar Permainan"
            >
                <X size={24} strokeWidth={3} />
            </button>

            {timeLeft !== undefined && (
                <div className={`bg-white px-4 py-2 rounded-2xl border-b-4 border-slate-200 shadow-sm flex items-center gap-2 transition-colors ${timeLeft < 30 ? 'bg-red-50 border-red-200 animate-pulse' : ''}`}>
                    <Clock size={20} className={timeLeft < 30 ? 'text-cardinal' : 'text-slate-400'} strokeWidth={2.5}/>
                    <span className={`font-black text-xl font-mono ${timeLeft < 30 ? 'text-cardinal' : 'text-slate-700'}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* KANAN: Nyawa & Skor */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Nyawa */}
        <div className={`flex gap-1 bg-white/90 backdrop-blur-md p-2 rounded-2xl border-b-4 border-slate-200 shadow-sm transition-transform duration-100 ${isShaking ? 'translate-x-[-5px] border-cardinal' : ''}`}>
            {Array.from({ length: maxHearts }).map((_, i) => {
                const isActive = i < hearts;
                return (
                    <Heart 
                        key={i} 
                        size={26} 
                        fill={isActive ? "#ff4b4b" : "#e2e8f0"} 
                        className={`transition-all duration-300 ${isActive ? "text-cardinal scale-100" : "text-slate-200 scale-90"}`} 
                        strokeWidth={2.5}
                    />
                );
            })}
        </div>

        {/* Skor */}
        <div className="bg-white px-5 py-2.5 rounded-2xl border-b-4 border-slate-200 shadow-sm min-w-[100px]">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 text-right">
                {mode === 'coop' ? 'Team Score' : 'Total XP'}
            </div>
            <div className="font-black text-2xl text-slate-700 flex items-center justify-end gap-2">
                <Star size={24} fill="#ffc800" className="text-bee-dark" strokeWidth={2.5} />
                <span>{mode === 'coop' ? score + opponentScore : score}</span>
            </div>
        </div>
      </div>

    </div>
  );
};
