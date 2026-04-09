import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../lib/AppContext';
import { supabase } from '../../lib/supabase';
import { Users, Gamepad2, MessageSquare, Activity, ChevronRight, BarChart2, Star, Clock } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { ActivityLog } from '../../types';

interface DashboardStats {
  totalStudents: number;
  activeGames: number;
  totalMessages: number;
  avgLevel: number;
}

/**
 * Komponen dashboard utama untuk guru.
 * Menampilkan ringkasan statistik, menu cepat, dan log aktivitas terkini.
 * 
 * @param {object} props - Properti komponen TeacherDashboard.
 * @param {(tab: string) => void} props.onNavigate - Fungsi callback untuk navigasi antar tab di dashboard guru.
 * @returns {JSX.Element} Elemen antarmuka dashboard guru.
 */
export const TeacherDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { userData } = useAppContext();
  const [stats, setStats] = useState<DashboardStats>({ totalStudents: 0, activeGames: 0, totalMessages: 0, avgLevel: 0 });
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Students Count & Avg Level
        const { data: students } = await supabase.from('users_data').select('level').eq('role', 'siswa');
        const totalStudents = students?.length || 0;
        const avgLevel = totalStudents > 0 
            ? Math.round(students!.reduce((acc, curr) => acc + (curr.level || 1), 0) / totalStudents) 
            : 0;

        // 2. Get Active Games
        const { count: activeGames } = await supabase.from('game_rooms').select('*', { count: 'exact', head: true }).eq('status', 'playing');

        // 3. Get Messages Count (Approx)
        const { count: totalMessages } = await supabase.from('forum_messages').select('*', { count: 'exact', head: true });

        // 4. Get Recent Activities
        const { data: logs } = await supabase
            .from('activity_logs')
            .select(`*, users_data ( avatar_config )`)
            .order('created_at', { ascending: false })
            .limit(6);
        
        const formattedLogs: ActivityLog[] = logs?.map((item: Record<string, unknown>) => ({
            ...item,
            avatar_config: (item.users_data as any)?.avatar_config
        })) as ActivityLog[] || [];

        setStats({ totalStudents, activeGames: activeGames || 0, totalMessages: totalMessages || 0, avgLevel });
        setRecentLogs(formattedLogs);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ icon, label, value, color, onClick }: { icon: React.ReactElement, label: string, value: string | number, color: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform ${color.replace('bg-', 'text-')}`}>
            {React.cloneElement(icon, { size: 64 })}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${color}`}>
            {icon}
        </div>
        <h3 className="text-3xl font-black text-slate-700 mb-1">{value}</h3>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{label}</p>
    </div>
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* HERO SECTION */}
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-macaw-light/20 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="relative shrink-0">
                <Avatar config={userData?.avatar_config} size={100} className="bg-white border-4 border-slate-50 shadow-lg" />
                <div className="absolute -bottom-2 -right-2 bg-macaw text-white px-3 py-1 rounded-full text-xs font-black border-2 border-white uppercase tracking-wider">
                    GURU
                </div>
            </div>
            
            <div className="flex-1 text-center md:text-left z-10">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                    Selamat Datang, {userData?.username || 'Guru'}! 👋
                </h1>
                <p className="text-slate-500 font-medium max-w-xl">
                    Pantau perkembangan siswa, kelola kelas, dan lihat aktivitas belajar terbaru dalam satu tampilan.
                </p>
            </div>

            <div className="flex gap-3 z-10">
                <button onClick={() => onNavigate('students')} className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors shadow-lg active:scale-95">
                    Kelola Siswa
                </button>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
                icon={<Users size={24} />} 
                label="Total Siswa" 
                value={loading ? '-' : stats.totalStudents} 
                color="bg-macaw"
                onClick={() => onNavigate('students')}
            />
            <StatCard 
                icon={<Gamepad2 size={24} />} 
                label="Game Aktif" 
                value={loading ? '-' : stats.activeGames} 
                color="bg-bee"
                onClick={() => onNavigate('games')}
            />
            <StatCard 
                icon={<Star size={24} />} 
                label="Rata-rata Level" 
                value={loading ? '-' : stats.avgLevel} 
                color="bg-feather"
                onClick={() => onNavigate('statistics')}
            />
            <StatCard 
                icon={<MessageSquare size={24} />} 
                label="Total Diskusi" 
                value={loading ? '-' : stats.totalMessages} 
                color="bg-cardinal"
                onClick={() => onNavigate('forum')}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: SHORTCUTS & MINI STATS */}
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                    <h3 className="font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart2 size={20} className="text-slate-400" />
                        Menu Cepat
                    </h3>
                    <div className="space-y-3">
                        <button onClick={() => onNavigate('statistics')} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between hover:bg-white hover:border-macaw group transition-all">
                            <div className="flex items-center gap-3">
                                <div className="bg-macaw-light/20 p-2 rounded-lg text-macaw group-hover:bg-macaw group-hover:text-white transition-colors">
                                    <BarChart2 size={20} />
                                </div>
                                <span className="font-bold text-slate-600 group-hover:text-slate-800">Lihat Statistik Detail</span>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-macaw" />
                        </button>
                        <button onClick={() => onNavigate('games')} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between hover:bg-white hover:border-bee group transition-all">
                            <div className="flex items-center gap-3">
                                <div className="bg-bee-light/20 p-2 rounded-lg text-bee-dark group-hover:bg-bee group-hover:text-white transition-colors">
                                    <Gamepad2 size={20} />
                                </div>
                                <span className="font-bold text-slate-600 group-hover:text-slate-800">Monitor Multiplayer</span>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-bee-dark" />
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTIVITY FEED */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-extrabold text-slate-700 flex items-center gap-2">
                            <Activity size={20} className="text-slate-400" />
                            Aktivitas Terkini
                        </h3>
                        <button onClick={() => onNavigate('activities')} className="text-xs font-bold text-macaw hover:underline uppercase tracking-wide">
                            Lihat Semua
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-slate-400 font-bold animate-pulse">Memuat data...</div>
                        ) : recentLogs.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-bold">Belum ada aktivitas siswa.</div>
                        ) : (
                            recentLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                                    <div className="shrink-0">
                                        <Avatar config={log.avatar_config} size={40} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-extrabold text-slate-700 text-sm">{log.username}</p>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                                <Clock size={10} /> {formatTime(log.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-snug mt-0.5">
                                            {log.action_type === 'level_up' ? 'Naik level ke ' : 'Menyelesaikan '}
                                            <span className={`font-bold ${log.action_type === 'level_up' ? 'text-bee-dark' : 'text-feather'}`}>
                                                {log.details}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};