import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, RefreshCw, Gamepad2, Users, Clock, AlertTriangle, Map, ShieldAlert } from 'lucide-react';
import { Button } from '../shared/Button';
import { useAppContext } from '../../lib/AppContext';

interface GameRoom {
  code: string;
  game_type?: 'maze' | 'adventure';
  created_by: string;
  player_1_name: string;
  player_2_name: string | null;
  score_p1?: number;
  score_p2?: number;
  mode: 'solo' | 'coop' | 'duel';
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}

/**
 * Komponen untuk guru memantau permainan multiplayer yang sedang berlangsung.
 * Menampilkan daftar room game, status, pemain, dan skor.
 * Memungkinkan guru untuk menghapus room tertentu atau semua room.
 * 
 * @returns {JSX.Element} Elemen antarmuka monitor game.
 */
export const GameMonitor: React.FC = () => {
  const { showConfirm, showAlert } = useAppContext();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [roomFilter, setRoomFilter] = useState<'all' | 'waiting' | 'playing' | 'finished'>('all');
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    setDbError(null);
    try {
      const { data, error } = await supabase.from('game_rooms').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRooms(data || []);
    } catch (error: unknown) {
      console.error("Error fetching rooms:", error);
      const err = error as any;
      if (err.code === '42P01') {
          setDbError("Tabel 'game_rooms' tidak ditemukan.");
      } else {
          setDbError(err.message || "Terjadi kesalahan");
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const channel = supabase.channel('monitor_rooms').on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms' }, () => { fetchRooms(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const deleteRoom = (code: string) => {
    showConfirm(
        "Hapus Room?", 
        `Apakah Anda yakin ingin menghapus room ${code}? Pemain yang sedang bermain akan terputus.`,
        async () => {
            try {
              const { error } = await supabase.from('game_rooms').delete().eq('code', code);
              if (error) throw error;
              setRooms(rooms.filter(r => r.code !== code));
            } catch (error: unknown) {
              const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
              showAlert("Gagal", msg, "danger");
            }
        },
        "danger"
    );
  };

  const handleDeleteAll = () => {
      showConfirm(
          "HAPUS SEMUA ROOM?",
          "PERINGATAN KERAS: Anda akan menghapus SELURUH room game yang ada di server.\n\nSemua siswa yang sedang bermain akan dikeluarkan secara paksa.\nApakah Anda yakin?",
          async () => {
              setDeleting(true);
              try {
                  const { error } = await supabase.from('game_rooms').delete().neq('code', '0');
                  if (error) throw error;
                  showAlert("Sukses", "Semua room game berhasil dibersihkan.", "success");
                  fetchRooms();
              } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
                  showAlert("Gagal", `Gagal menghapus semua room: ${msg}`, "danger");
              } finally {
                  setDeleting(false);
              }
          },
          "danger"
      );
  };

  const filteredRooms = rooms.filter(r => roomFilter === 'all' || r.status === roomFilter);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gamepad2 size={28} className="text-macaw" />
            Monitor Game Multiplayer
          </h1>
          <p className="text-slate-500">Pantau Labirin & Petualangan Jelajah secara real-time.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['all', 'waiting', 'playing', 'finished'] as const).map(status => (
                <button key={status} onClick={() => setRoomFilter(status)} className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${roomFilter === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {status === 'all' ? 'Semua' : status === 'waiting' ? 'Menunggu' : status === 'playing' ? 'Main' : 'Selesai'}
                </button>
              ))}
           </div>
           
           <Button 
                variant="danger" 
                size="sm" 
                onClick={handleDeleteAll} 
                disabled={deleting || rooms.length === 0}
                className="bg-cardinal hover:bg-cardinal-dark border-cardinal-dark"
                icon={deleting ? <RefreshCw className="animate-spin" size={16}/> : <ShieldAlert size={16}/>}
           >
               HAPUS SEMUA
           </Button>

           <button onClick={fetchRooms} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
              <RefreshCw size={20} className={loadingRooms ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {dbError && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-xl mb-6 text-cardinal flex items-start gap-3">
              <AlertTriangle size={24} className="shrink-0 mt-0.5" />
              <div>
                  <h3 className="font-extrabold text-sm uppercase mb-1">Database Error</h3>
                  <p className="text-sm font-bold">{dbError}</p>
              </div>
          </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tipe & Kode</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Pemain & Skor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingRooms ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat data room...</td></tr>
              ) : filteredRooms.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Tidak ada room aktif.</td></tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.code} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                           {room.game_type === 'adventure' ? <Map size={16} className="text-fox"/> : <Gamepad2 size={16} className="text-bee-dark"/>}
                           <span className="font-mono text-lg font-extrabold tracking-widest text-slate-700 bg-slate-100 px-2 py-1 rounded">{room.code}</span>
                       </div>
                       <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 ml-6">{room.game_type || 'Maze'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase border ${room.mode === 'coop' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{room.mode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center justify-between gap-4 font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                              <div className="flex items-center gap-2"><Users size={14} className="text-slate-400" /> {room.player_1_name}</div>
                              {room.game_type === 'adventure' && <span className="text-bee-dark">{room.score_p1 || 0} XP</span>}
                          </div>
                          {room.player_2_name ? (
                              <div className="flex items-center justify-between gap-4 font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300"></div> {room.player_2_name}</div>
                                  {room.game_type === 'adventure' && <span className="text-bee-dark">{room.score_p2 || 0} XP</span>}
                              </div>
                          ) : (
                              <div className="text-slate-400 italic text-xs ml-6">Menunggu P2...</div>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex w-fit items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${room.status === 'playing' ? 'bg-macaw-light/20 text-macaw-dark border-macaw/20 animate-pulse' : room.status === 'waiting' ? 'bg-bee-light/30 text-bee-dark border-bee/30' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          <div className={`w-2 h-2 rounded-full ${room.status === 'playing' ? 'bg-macaw' : room.status === 'waiting' ? 'bg-bee' : 'bg-slate-400'}`}></div>
                          {room.status === 'waiting' ? 'Menunggu' : room.status === 'playing' ? 'Berlangsung' : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-bold">
                      <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(room.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => deleteRoom(room.code)} className="text-cardinal hover:bg-cardinal-light/20 p-2 rounded-lg transition-colors" title="Hapus Room">
                          <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};