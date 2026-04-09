import React, { useState, useEffect } from 'react';
import { supabase, UserData } from '../../lib/supabase';
import { Avatar } from './Avatar';
import { Medal } from 'lucide-react';

/**
 * Komponen Leaderboard untuk menampilkan peringkat siswa berdasarkan XP tertinggi.
 * Mengambil data dari tabel `users_data` di Supabase.
 * 
 * @returns {JSX.Element} Elemen leaderboard yang dirender.
 */
export const Leaderboard: React.FC = () => {
  const [students, setStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users_data')
          .select('*')
          .eq('role', 'siswa')
          .order('exp', { ascending: false })
          .limit(20);

        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error("Gagal load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
      if (index === 0) return <Medal size={36} className="text-yellow-400 drop-shadow-sm" fill="#facc15" />;
      if (index === 1) return <Medal size={36} className="text-slate-400 drop-shadow-sm" fill="#94a3b8" />;
      if (index === 2) return <Medal size={36} className="text-orange-400 drop-shadow-sm" fill="#fb923c" />;
      return <span className="font-extrabold text-xl text-slate-500 font-mono w-9 text-center">{index + 1}</span>;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-700 mb-2">Papan Peringkat</h1>
        <p className="text-slate-400 font-bold">Raih XP sebanyak mungkin untuk naik ke puncak!</p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
           <div className="p-8 text-center font-bold text-slate-400">Memuat peringkat...</div>
        ) : students.length === 0 ? (
           <div className="p-8 text-center font-bold text-slate-400">Belum ada data siswa.</div>
        ) : (
            students.map((student, index) => {
                return (
                    <div 
                        key={student.id} 
                        className={`flex items-center gap-4 p-4 border-b-2 border-slate-100 hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-yellow-50/20' : ''}`}
                    >
                        <div className="w-14 flex justify-center shrink-0">
                            {getRankIcon(index)}
                        </div>
                        <div className="shrink-0">
                            <Avatar config={student.avatar_config} size={48} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className={`font-extrabold truncate text-lg ${index === 0 ? 'text-yellow-600' : 'text-slate-700'}`}>
                                {student.username || 'Tanpa Nama'}
                            </h3>
                            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase">
                                Lv. {student.level}
                            </div>
                        </div>
                        <div className="text-right px-2">
                             <div className="font-extrabold text-slate-700">{student.exp} XP</div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};