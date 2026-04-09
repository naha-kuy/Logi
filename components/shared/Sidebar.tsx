import React from 'react';
import { 
  Trophy, User, Hexagon, MessageSquare, 
  BarChart2, Users, LogOut, ChevronLeft, ChevronRight, 
  Bot, BrainCircuit, Gamepad2, Map, Home, MonitorPlay, Activity, LayoutDashboard
} from 'lucide-react';
import { UserData } from '../../lib/supabase';

interface SidebarProps {
  userData: UserData;
  activeTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

/**
 * Komponen Sidebar untuk navigasi utama aplikasi.
 * Menampilkan menu yang berbeda berdasarkan peran pengguna (guru atau siswa).
 * Mendukung tampilan responsif (dapat di-collapse pada desktop, menjadi drawer pada mobile).
 * 
 * @param {SidebarProps} props - Properti komponen Sidebar.
 * @param {UserData} props.userData - Data pengguna saat ini untuk menentukan menu yang ditampilkan.
 * @param {string} props.activeTab - ID tab yang sedang aktif.
 * @param {(tab: string) => void} props.onNavigate - Fungsi callback saat item menu diklik.
 * @param {boolean} props.isOpen - Status apakah sidebar sedang terbuka atau tertutup (collapsed).
 * @param {() => void} props.onToggle - Fungsi callback untuk mengubah status buka/tutup sidebar.
 * @param {() => void} props.onLogout - Fungsi callback untuk proses logout.
 * @returns {JSX.Element} Elemen sidebar yang dirender.
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  userData, 
  activeTab,
  onNavigate,
  isOpen, 
  onToggle,
  onLogout
}) => {
  
  const studentItems = [
    { id: 'dashboard', label: 'Beranda', icon: <Home size={28} /> }, 
    { id: 'learn', label: 'Belajar', icon: <Hexagon size={28} /> },
    { id: 'chatbot', label: 'LogiChat', icon: <Bot size={28} /> }, 
    { id: 'challenges', label: 'Zona Latihan', icon: <BrainCircuit size={28} /> }, 
    { id: 'maze', label: 'Labirin', icon: <Gamepad2 size={28} /> },
    { id: 'adventure', label: 'Petualangan', icon: <Map size={28} /> },
    { id: 'leaderboard', label: 'Peringkat', icon: <Trophy size={28} /> },
    { id: 'forum', label: 'Diskusi', icon: <MessageSquare size={28} /> },
    { id: 'profile', label: 'Profil', icon: <User size={28} /> },
  ];

  const teacherItems = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={28} /> }, // New Overview Dashboard
    { id: 'students', label: 'Siswa', icon: <Users size={28} /> },
    { id: 'activities', label: 'Log Aktivitas', icon: <Activity size={28} /> }, 
    { id: 'statistics', label: 'Statistik', icon: <BarChart2 size={28} /> },
    { id: 'games', label: 'Monitor Game', icon: <MonitorPlay size={28} /> },
    { id: 'leaderboard', label: 'Peringkat', icon: <Trophy size={28} /> }, 
    { id: 'forum', label: 'Forum Diskusi', icon: <MessageSquare size={28} /> },
    { id: 'profile', label: 'Profil Saya', icon: <User size={28} /> },
  ];

  const items = userData.role === 'guru' ? teacherItems : studentItems;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onToggle} />
      )}

      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-white border-r-2 border-slate-200 z-30
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-24 md:translate-x-0'}
        `}
      >
        <div className={`flex items-center gap-3 p-6 h-24 ${!isOpen && 'md:justify-center'}`}>
          <div className={`text-feather font-extrabold text-3xl tracking-tighter shrink-0 transition-opacity duration-300 ${!isOpen && 'md:hidden opacity-0'}`}>
             Logi
          </div>
          {!isOpen && (
            <div className="hidden md:block text-feather font-extrabold text-2xl">L</div>
          )}
        </div>

        <button 
          onClick={onToggle}
          className={`
            absolute -right-4 top-8 
            w-8 h-8 rounded-full 
            bg-white border-2 border-slate-200 
            flex items-center justify-center 
            text-slate-400 hover:text-feather hover:border-feather 
            shadow-sm transition-all duration-300 z-50
            hover:scale-110 active:scale-95
            ${!isOpen && 'md:rotate-0'} 
          `}
          title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
        </button>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden pb-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border-2 border-transparent uppercase font-bold tracking-wide text-sm
                ${activeTab === item.id 
                  ? 'bg-macaw-light/20 text-macaw border-macaw-light/50' 
                  : 'text-slate-500 hover:bg-slate-100'}
                ${!isOpen && 'md:justify-center md:px-0'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 md:hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-slate-100 mb-safe">
            <button 
                onClick={onLogout}
                className={`mt-2 w-full flex items-center gap-2 justify-center text-slate-400 hover:text-cardinal text-sm font-bold uppercase tracking-wider py-2 transition-all ${!isOpen && 'md:justify-center'}`}
                title="Keluar"
            >
                <LogOut size={20} /> 
                <span className={`${isOpen ? 'inline' : 'hidden'} ml-1`}>Keluar</span>
            </button>
        </div>
      </aside>
    </>
  );
};