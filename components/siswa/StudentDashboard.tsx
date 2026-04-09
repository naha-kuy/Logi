import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, UserData } from '../../lib/supabase';
import { Unit, ActivityLog } from '../../types';
import { Avatar } from '../shared/Avatar';
import { getLevelProgress } from '../../lib/levelSystem';
import { 
  Zap, ChevronRight, 
  Bot, BrainCircuit, Gamepad2, Map, Play, Clock, Activity, Star, Users, CheckCircle
} from 'lucide-react';
import { PretestFlow } from './PretestFlow'; // Import Pretest

interface StudentDashboardProps {
  userData: UserData;
  units: Unit[];
  onNavigate: (tab: string) => void;
}

/**
 * Komponen dasbor utama untuk siswa.
 * Menampilkan ringkasan progres belajar, aktivitas teman, dan akses cepat ke berbagai fitur (materi, game, chat).
 * 
 * @param {StudentDashboardProps} props - Properti komponen StudentDashboard.
 * @param {UserData} props.userData - Data pengguna siswa saat ini.
 * @param {Unit[]} props.units - Daftar unit materi pembelajaran.
 * @param {(tab: string) => void} props.onNavigate - Callback untuk navigasi antar tab/halaman.
 * @returns {JSX.Element} Elemen antarmuka dasbor siswa.
 */
export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userData: initialUserData, units, onNavigate }) => {
  const [localUserData, setLocalUserData] = useState<UserData>(initialUserData);

  // --- REACT QUERY FOR ACTIVITIES ---
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`*, users_data ( avatar_config )`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data.map((item: Record<string, unknown>) => ({
        ...item,
        avatar_config: (item.users_data as any)?.avatar_config
      })) as ActivityLog[];
    }
  });

  // --- REACT QUERY FOR USER DATA REFRESH ---
  const { data: refreshedUserData } = useQuery({
    queryKey: ['userData', initialUserData.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users_data')
        .select('exp, level, streak, completed_lessons, has_completed_pretest, has_completed_posttest, posttest_score')
        .eq('id', initialUserData.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (refreshedUserData) {
      setLocalUserData(prev => ({
        ...prev,
        exp: refreshedUserData.exp,
        level: refreshedUserData.level,
        streak: refreshedUserData.streak,
        completed_lessons: refreshedUserData.completed_lessons,
        has_completed_pretest: refreshedUserData.has_completed_pretest,
        has_completed_posttest: refreshedUserData.has_completed_posttest,
        posttest_score: refreshedUserData.posttest_score
      }));
    }
  }, [refreshedUserData]);
  // Mencari Unit dan Lesson "tertinggi" yang belum diselesaikan (Next Step)
  let activeUnit = units[0];
  let activeLesson = units[0].lessons[0];
  let isCourseCompleted = true;

  // Loop linear sesuai urutan kurikulum untuk menemukan materi pertama yang belum selesai
  for (const unit of units) {
      let foundInUnit = false;
      for (const lesson of unit.lessons) {
          if (!localUserData.completed_lessons.includes(lesson.id)) {
              activeUnit = unit;
              activeLesson = lesson;
              isCourseCompleted = false;
              foundInUnit = true;
              break; // Ketemu lesson yang harus dikerjakan
          }
      }
      if (foundInUnit) break; // Ketemu unit yang sedang aktif
  }

  // Jika semua selesai, tampilkan materi terakhir
  if (isCourseCompleted) {
      const lastUnit = units[units.length - 1];
      activeUnit = lastUnit;
      activeLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam';

  /**
   * Mengubah format waktu ISO menjadi format relatif (misal: "Baru saja", "5 menit lalu").
   * 
   * @param {string} isoString - String waktu dalam format ISO.
   * @returns {string} String waktu relatif.
   */
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  const levelStats = getLevelProgress(localUserData.exp);

  // --- PRETEST CHECK ---
  // Jika belum mengerjakan pretest, tampilkan PretestFlow (Overlay Fullscreen)
  if (localUserData.has_completed_pretest === false) {
      return (
          <PretestFlow 
            grade={localUserData.grade || '8'} 
            onComplete={() => setLocalUserData(prev => ({ ...prev, has_completed_pretest: true }))} 
          />
      );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-bee-light/20 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
              <div className="relative">
                <Avatar config={localUserData.avatar_config} size={80} className="bg-white border-4 border-slate-100 shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-bee text-bee-dark text-xs font-black px-2 py-1 rounded-lg border-2 border-white shadow-sm">
                    Lvl {levelStats.currentLevel}
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                  <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">{greeting}</h2>
                  <h1 className="text-3xl font-extrabold text-slate-800 leading-none mb-3">{localUserData.username}</h1>
                  <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                          <span>{levelStats.progressInLevel} XP</span>
                          <span>Menuju Lvl {levelStats.nextLevel} ({levelStats.xpToNextLevel} lagi)</span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                          <div 
                              className="h-full bg-gradient-to-r from-bee to-fox rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,200,0,0.5)]"
                              style={{ width: `${levelStats.percentage}%` }}
                          >
                              <div className="w-full h-full bg-white/20 animate-pulse"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="hidden md:flex gap-4 relative z-10">
               <div className="flex flex-col items-center bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 min-w-[80px]">
                   <span className="text-xs font-bold text-slate-400 uppercase">Streak</span>
                   <div className="flex items-center gap-1 text-fox font-black text-xl">
                       <Zap size={20} fill="currentColor" /> {localUserData.streak}
                   </div>
               </div>
               <div className="flex flex-col items-center bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 min-w-[80px]">
                   <span className="text-xs font-bold text-slate-400 uppercase">Total XP</span>
                   <div className="flex items-center gap-1 text-feather font-black text-xl">
                       <Star size={20} fill="currentColor" /> {localUserData.exp}
                   </div>
               </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div>
                <h3 className="text-slate-700 font-extrabold text-lg mb-4 flex items-center gap-2">
                    <Map size={20} className="text-slate-400"/>
                    Perjalanan Belajar
                </h3>
                <div onClick={() => onNavigate('learn')} className="bg-white border-2 border-slate-200 rounded-3xl p-6 cursor-pointer hover:border-feather hover:shadow-lg hover:-translate-y-1 transition-all group flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-feather"></div>
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-feather/30 ${activeUnit.color} group-hover:scale-110 transition-transform duration-300`}>
                            {isCourseCompleted ? <CheckCircle size={32} /> : <Play size={32} fill="currentColor" />}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-feather uppercase mb-1 tracking-wider">
                                {localUserData.has_completed_posttest ? "Perjalanan Selesai!" : isCourseCompleted ? "Semua Materi Selesai!" : "Lanjutkan Materi"}
                            </div>
                            <h4 className="text-2xl font-extrabold text-slate-700 group-hover:text-feather transition-colors line-clamp-1">
                                {localUserData.has_completed_posttest ? "Lihat Roadmap" : isCourseCompleted ? "Ujian Akhir (Post-test)" : activeLesson.title}
                            </h4>
                            <p className="text-sm text-slate-500 font-bold mt-1">{isCourseCompleted ? "Selesaikan perjalananmu" : activeUnit.title}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-full text-slate-300 group-hover:text-feather group-hover:bg-feather-light/20 transition-all">
                        <ChevronRight size={28} strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div>
                 <h3 className="text-slate-700 font-extrabold text-lg mb-4 flex items-center gap-2">
                    <Gamepad2 size={20} className="text-slate-400"/>
                    Zona Aktivitas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionButton icon={<Bot size={28} />} label="LogiChat" color="macaw" onClick={() => onNavigate('chatbot')} />
                    <ActionButton icon={<BrainCircuit size={28} />} label="Ujian" color="cardinal" onClick={() => onNavigate('challenges')} />
                    <ActionButton icon={<Gamepad2 size={28} />} label="Labirin" color="bee" onClick={() => onNavigate('maze')} />
                    <ActionButton icon={<Map size={28} />} label="Jelajah" color="fox" onClick={() => onNavigate('adventure')} />
                </div>
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-700 font-extrabold text-lg flex items-center gap-2">
                    <Activity size={20} className="text-slate-400"/>
                    Aktivitas Teman
                </h3>
            </div>
            
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 min-h-[300px] flex flex-col">
                {loadingActivities ? (
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 items-start animate-pulse">
                                <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400">
                        <Users size={48} className="mb-2 opacity-20" />
                        <p className="font-bold">Belum ada aktivitas.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activities.map((act) => (
                            <div key={act.id} className="flex gap-3 items-start animate-in slide-in-from-right-4 duration-500">
                                <div className="shrink-0 pt-1">
                                    <Avatar config={act.avatar_config} size={36} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-600 leading-snug">
                                        <span className="font-extrabold text-slate-800">{act.username}</span>
                                        {' '}
                                        {act.action_type === 'lesson_complete' && 'menyelesaikan'}
                                        {act.action_type === 'level_up' && 'naik ke'}
                                        {act.action_type === 'pretest_complete' && 'selesai'}
                                        {' '}
                                        <span className={`font-bold ${act.action_type === 'level_up' ? 'text-bee-dark' : 'text-feather'}`}>
                                            {act.details}
                                        </span>
                                    </p>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock size={10} /> {formatTime(act.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={() => onNavigate('leaderboard')} className="w-full mt-auto pt-6 pb-2 text-sm font-extrabold text-slate-400 hover:text-macaw transition-colors border-t-2 border-slate-50 uppercase tracking-wide">
                    LIHAT SEMUA PERINGKAT
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    color: 'macaw' | 'cardinal' | 'bee' | 'fox';
    onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onClick }) => {
    const colorClasses: Record<ActionButtonProps['color'], string> = {
        macaw: "text-macaw bg-macaw-light/20 group-hover:bg-macaw group-hover:text-white border-macaw/30",
        cardinal: "text-cardinal bg-cardinal-light/20 group-hover:bg-cardinal group-hover:text-white border-cardinal/30",
        bee: "text-bee-dark bg-bee-light/40 group-hover:bg-bee group-hover:text-white border-bee/30",
        fox: "text-fox bg-fox/20 group-hover:bg-fox group-hover:text-white border-fox/30"
    };

    return (
        <button onClick={onClick} className="group flex flex-col items-center justify-center p-4 bg-white border-b-4 border-2 border-slate-200 rounded-2xl hover:border-slate-300 active:border-b-2 active:translate-y-[2px] transition-all">
            <div className={`p-4 rounded-2xl mb-3 transition-colors duration-300 border-2 ${colorClasses[color]}`}>
                {icon}
            </div>
            <span className="font-extrabold text-slate-600 text-xs uppercase tracking-wide group-hover:text-slate-800">{label}</span>
        </button>
    )
}