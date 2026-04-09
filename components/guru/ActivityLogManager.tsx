import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityLog } from '../../types';
import { Trash2, Search, RefreshCw, Activity, Filter, CheckCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Avatar } from '../shared/Avatar';
import { useAppContext } from '../../lib/AppContext';

/**
 * Komponen untuk guru mengelola log aktivitas siswa.
 * Memungkinkan guru untuk melihat, mencari, memfilter, dan menghapus log aktivitas.
 * 
 * @returns {JSX.Element} Elemen antarmuka pengelola log aktivitas.
 */
export const ActivityLogManager: React.FC = () => {
  const { showConfirm, showAlert } = useAppContext();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'level_up' | 'lesson_complete'>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`*, users_data ( avatar_config )`)
        .order('created_at', { ascending: false })
        .limit(100); 

      if (error) throw error;
      
      const formattedData: ActivityLog[] = data.map((item: Record<string, unknown>) => ({
        ...item,
        avatar_config: (item.users_data as any)?.avatar_config
      })) as ActivityLog[];
      setLogs(formattedData);
    } catch (err) {
      console.error("Gagal mengambil log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = (id: string) => {
      showConfirm("Hapus Log?", "Apakah Anda yakin ingin menghapus catatan aktivitas ini secara permanen?", async () => {
          try {
              const { error } = await supabase.from('activity_logs').delete().eq('id', id);
              if(error) throw error;
              setLogs(prev => prev.filter(l => l.id !== id));
          } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
              showAlert("Error", "Gagal menghapus log: " + msg, "danger");
          }
      }, "danger");
  };

  const handleClearAll = () => {
      showConfirm(
          "Bersihkan Semua Log?", 
          "Ini akan menghapus SELURUH riwayat aktivitas siswa (level up, penyelesaian materi, dll).\nDashboard siswa akan terlihat kosong.\n\nLanjutkan?",
          async () => {
              setDeleting(true);
              try {
                  const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
                  if(error) throw error;
                  setLogs([]);
                  showAlert("Sukses", "Log aktivitas berhasil dibersihkan.", "success");
              } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
                  showAlert("Error", "Gagal membersihkan log: " + msg, "danger");
              } finally {
                  setDeleting(false);
              }
          },
          "danger"
      );
  };

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.username.toLowerCase().includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'all' || log.action_type === filterType;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={28} className="text-macaw" />
                    Aktivitas Siswa
                </h1>
                <p className="text-slate-500 text-sm">Kelola notifikasi yang muncul di dashboard siswa.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={handleClearAll} disabled={deleting || logs.length === 0} icon={deleting ? <RefreshCw className="animate-spin" size={16}/> : <Trash2 size={16}/>}>
                    BERSIHKAN LOG
                </Button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="Cari nama siswa atau aktivitas..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-macaw text-sm font-bold text-slate-700"
                />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Semua</button>
                <button onClick={() => setFilterType('level_up')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === 'level_up' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Naik Level</button>
                <button onClick={() => setFilterType('lesson_complete')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filterType === 'lesson_complete' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Selesai Materi</button>
            </div>
            <button onClick={fetchLogs} className="p-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-400 hover:text-macaw hover:border-macaw transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Waktu</th>
                            <th className="px-6 py-4">Siswa</th>
                            <th className="px-6 py-4">Tipe Aktivitas</th>
                            <th className="px-6 py-4">Detail</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Memuat log...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada aktivitas ditemukan.</td></tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar config={log.avatar_config} size={32} />
                                            <span className="font-bold text-slate-700">{log.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${log.action_type === 'level_up' ? 'bg-bee-light/20 text-bee-dark border-bee/20' : 'bg-feather-light/20 text-feather-dark border-feather/20'}`}>
                                            {log.action_type === 'level_up' ? 'Naik Level' : 'Materi Selesai'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {log.details}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDeleteLog(log.id)} className="text-slate-400 hover:text-cardinal transition-colors p-2 rounded-full hover:bg-red-50">
                                            <Trash2 size={16} />
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