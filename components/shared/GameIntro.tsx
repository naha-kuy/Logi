import React, { useState } from 'react';
import { Play, Users, User, Swords, ArrowLeft, Info } from 'lucide-react';
import { Button } from './Button';

export interface GameIntroProps {
  title: string;
  description: string;
  rules: string[];
  type: 'exam' | 'maze' | 'adventure';
  onBack: () => void;
  onStart: (mode: 'solo' | 'coop' | 'duel') => void;
}

/**
 * Komponen layar pengantar sebelum memulai permainan atau latihan.
 * Menampilkan judul, deskripsi, aturan, dan pilihan mode permainan (solo, coop, duel).
 * 
 * @param {GameIntroProps} props - Properti komponen GameIntro.
 * @param {string} props.title - Judul permainan atau latihan.
 * @param {string} props.description - Deskripsi singkat tentang permainan.
 * @param {string[]} props.rules - Daftar aturan permainan.
 * @param {'exam' | 'maze' | 'adventure'} props.type - Jenis permainan untuk menentukan tema warna.
 * @param {() => void} props.onBack - Fungsi callback saat tombol kembali diklik.
 * @param {(mode: 'solo' | 'coop' | 'duel') => void} props.onStart - Fungsi callback saat tombol mulai diklik, mengirimkan mode yang dipilih.
 * @returns {JSX.Element} Elemen layar pengantar yang dirender.
 */
export const GameIntro: React.FC<GameIntroProps> = ({ 
  title, description, rules, type, onBack, onStart 
}) => {
  const [selectedMode, setSelectedMode] = useState<'solo' | 'coop' | 'duel'>('solo');

  const theme = {
    exam: 'text-cardinal bg-cardinal',
    maze: 'text-bee-dark bg-bee',
    adventure: 'text-fox bg-fox',
  }[type];
  
  const borderTheme = {
    exam: 'border-cardinal',
    maze: 'border-bee',
    adventure: 'border-fox',
  }[type];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className={`p-8 text-center text-white ${theme}`}>
            <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-wide">{title}</h1>
            <p className="text-white/90 font-bold text-lg max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="p-8 space-y-8">
            <div>
                <h3 className="text-slate-700 font-extrabold text-xl mb-4 flex items-center gap-2">
                    <Info size={24} className={theme.split(' ')[0]} />
                    Aturan Permainan
                </h3>
                <ul className="space-y-3 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                    {rules.map((rule, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-600 font-medium">
                            <span className={`font-bold ${theme.split(' ')[0]}`}>{idx + 1}.</span>
                            {rule}
                        </li>
                    ))}
                </ul>
            </div>

            {type !== 'exam' && (
                <div>
                    <h3 className="text-slate-700 font-extrabold text-xl mb-4">Pilih Mode</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => setSelectedMode('solo')}
                            className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all ${
                                selectedMode === 'solo' 
                                ? `${borderTheme} bg-slate-50 ring-2 ring-offset-2 ring-slate-200` 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <User size={32} className={`mb-3 ${selectedMode === 'solo' ? theme.split(' ')[0] : 'text-slate-400'}`} />
                            <div className="font-extrabold text-slate-700">Individu</div>
                            <div className="text-xs text-slate-400 font-bold mt-1">Main sendiri</div>
                        </button>

                        <button 
                            onClick={() => setSelectedMode('coop')}
                            className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all ${
                                selectedMode === 'coop' 
                                ? `${borderTheme} bg-slate-50 ring-2 ring-offset-2 ring-slate-200` 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Users size={32} className={`mb-3 ${selectedMode === 'coop' ? theme.split(' ')[0] : 'text-slate-400'}`} />
                            <div className="font-extrabold text-slate-700">Kelompok</div>
                            <div className="text-xs text-slate-400 font-bold mt-1">Kerjasama tim</div>
                        </button>

                        <button 
                            onClick={() => setSelectedMode('duel')}
                            className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all ${
                                selectedMode === 'duel' 
                                ? `${borderTheme} bg-slate-50 ring-2 ring-offset-2 ring-slate-200` 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Swords size={32} className={`mb-3 ${selectedMode === 'duel' ? theme.split(' ')[0] : 'text-slate-400'}`} />
                            <div className="font-extrabold text-slate-700">Duel</div>
                            <div className="text-xs text-slate-400 font-bold mt-1">Lawan kelompok lain</div>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t-2 border-slate-100">
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    onClick={onBack}
                    icon={<ArrowLeft size={20} />}
                >
                    KEMBALI
                </Button>
                <Button 
                    variant={type === 'exam' ? 'danger' : 'primary'}
                    size="lg" 
                    className={`flex-[2] ${type === 'maze' ? 'bg-bee text-slate-800 border-bee-dark' : type === 'adventure' ? 'bg-fox border-fox-dark' : ''}`}
                    onClick={() => onStart(selectedMode)}
                    icon={<Play size={24} fill="currentColor" />}
                >
                    MULAI {type === 'exam' ? 'LATIHAN' : 'PERMAINAN'}
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
};