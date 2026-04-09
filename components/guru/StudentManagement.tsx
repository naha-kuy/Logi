import React, { useState, useEffect } from 'react';
import { supabase, UserData } from '../../lib/supabase';
import { Trash2, Search, Eye, EyeOff, GraduationCap, Star, Shield, RotateCcw } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { useAppContext } from '../../lib/AppContext';

/**
 * Komponen Baris Terpisah untuk menampilkan data satu siswa dalam tabel.
 * 
 * @param {object} props - Properti komponen StudentRow.
 * @param {UserData} props.student - Data siswa yang akan ditampilkan.
 * @param {(id: string, currentStatus: boolean) => void} props.onToggleStatus - Callback untuk mengubah status aktif/nonaktif siswa.
 * @param {(id: string, email: string) => void} props.onDelete - Callback untuk menghapus siswa.
 * @param {(id: string, username: string) => void} props.onReset - Callback untuk mereset progres siswa.
 * @returns {JSX.Element} Elemen baris tabel (tr) yang dirender.
 */
const StudentRow = ({ 
    student, 
    onToggleStatus, 
    onDelete,
    onReset
}: { 
    student: UserData, 
    onToggleStatus: (id: string, currentStatus: boolean) => void, 
    onDelete: (id: string, email: string) => void,
    onReset: (id: string, username: string) => void
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0">
                        <Avatar config={student.avatar_config} size={40} />
                    </div>
                    <div>
                        <div className="font-extrabold text-slate-700 text-sm">{student.username}</div>
                        <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                        <GraduationCap size={16} />
                    </div>
                    Kelas {student.grade || '-'}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-bee-dark">
                        <Star size={12} fill="currentColor" /> 
                        <span>Level {student.level}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                        {student.exp} XP
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-fit">
                    <span className={`font-mono text-xs font-bold ${showPassword ? 'text-slate-700' : 'text-slate-400 tracking-widest'}`}>
                        {showPassword ? (student.password_plain || 'N/A') : '••••••'}
                    </span>
                    <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-macaw ml-2 focus:outline-none"
                        title={showPassword ? "Sembunyikan" : "Lihat Password"}
                    >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </td>
            <td className="px-6 py-4">
                <button 
                    onClick={() => onToggleStatus(student.id, student.is_active)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                        student.is_active ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                    title={student.is_active ? "Akun Aktif" : "Akun Nonaktif"}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        student.is_active ? 'left-7' : 'left-1'
                    }`}></div>
                </button>
                <div className="text-[10px] font-bold text-slate-400 mt-1 text-center w-12">
                    {student.is_active ? 'Aktif' : 'Off'}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => onReset(student.id, student.username)}
                        className="p-2 text-slate-400 hover:text-bee-dark hover:bg-bee-light/20 rounded-xl transition-all"
                        title="Reset Progress & Pretest"
                    >
                        <RotateCcw size={18}/>
                    </button>
                    <button 
                        onClick={() => onDelete(student.id, student.email)} 
                        className="p-2 text-slate-400 hover:text-cardinal hover:bg-red-50 rounded-xl transition-all"
                        title="Hapus Siswa Permanen"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

/**
 * Komponen untuk guru mengelola data siswa.
 * Memungkinkan guru untuk melihat daftar siswa, mereset progress, menonaktifkan akun, dan menghapus siswa.
 * 
 * @returns {JSX.Element} Elemen antarmuka manajemen siswa.
 */
export const StudentManagement: React.FC = () => {
  const { showConfirm, showAlert } = useAppContext();
  const [students, setStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('users_data')
        .select('*')
        .eq('role', 'siswa')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const updatedStudents = students.map(s => s.id === id ? {...s, is_active: !currentStatus} : s);
    setStudents(updatedStudents);

    try {
      const { error } = await supabase.from('users_data').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      showAlert("Gagal Mengubah Status", msg, "danger");
      setStudents(students); // Revert
    }
  };

  const handleReset = (id: string, username: string) => {
      showConfirm(
          "Reset Progress Siswa?",
          `PERINGATAN: Anda akan mereset progress belajar ${username} KEMBALI KE NOL.\n\nSiswa akan kehilangan Level, XP, dan harus mengerjakan PRETEST ulang.\n\nLanjutkan?`,
          async () => {
              try {
                  const { error } = await supabase.from('users_data').update({
                      level: 1,
                      exp: 0,
                      completed_lessons: [],
                      has_completed_pretest: false
                  }).eq('id', id);
                  
                  if (error) throw error;
                  
                  setStudents(students.map(s => s.id === id ? { ...s, level: 1, exp: 0, completed_lessons: [], has_completed_pretest: false } : s));
                  showAlert("Berhasil", `Progress ${username} telah direset.`, "success");
              } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
                  showAlert("Gagal", msg, "danger");
              }
          },
          "danger"
      );
  };

  const handleDelete = (id: string, email: string) => {
    showConfirm(
        "Hapus Siswa?", 
        `PERINGATAN: Anda akan menghapus siswa ${email}.\n\nTindakan ini akan menghapus:\n1. Profil siswa\n2. Log aktivitas & XP\n3. Chat forum\n\nData tidak dapat dikembalikan.`, 
        async () => {
            try {
              const { error } = await supabase.from('users_data').delete().eq('id', id);
              if (error) throw error;
              
              setStudents(students.filter(s => s.id !== id));
              showAlert("Berhasil", `Siswa ${email} telah dihapus.`, "success");
            } catch (error: unknown) {
              console.error("Delete failed:", error);
              const msg = error instanceof Error ? error.message : "Pastikan Anda memiliki akses.";
              showAlert("Gagal Menghapus", msg, "danger");
            }
        }, 
        "danger"
    );
  };

  const filteredStudents = students.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase()) || 
    (s.username && s.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                   <Shield size={28} className="text-macaw" />
                   Manajemen Siswa
               </h1>
               <p className="text-slate-500 text-sm">Kelola akses, password, dan status akun siswa.</p>
           </div>
           
           <div className="relative w-full md:w-auto">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                   type="text" 
                   value={search} 
                   onChange={(e) => setSearch(e.target.value)} 
                   placeholder="Cari nama atau email..." 
                   className="pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-macaw text-sm font-bold text-slate-700 w-full md:w-72 shadow-sm transition-all"
               />
           </div>
       </div>

       <div className="bg-white rounded-3xl shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider border-b-2 border-slate-100">
               <tr>
                   <th className="px-6 py-4">Profil Siswa</th>
                   <th className="px-6 py-4">Kelas</th>
                   <th className="px-6 py-4">Progress</th>
                   <th className="px-6 py-4">Password</th>
                   <th className="px-6 py-4 text-center">Status</th>
                   <th className="px-6 py-4 text-right">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 bg-white">
               {loading ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold animate-pulse">Sedang memuat data siswa...</td></tr>
               ) : filteredStudents.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada siswa yang ditemukan.</td></tr>
               ) : (
                   filteredStudents.map(student => (
                     <StudentRow 
                        key={student.id} 
                        student={student} 
                        onToggleStatus={toggleStatus} 
                        onDelete={handleDelete}
                        onReset={handleReset}
                     />
                   ))
               )}
             </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t-2 border-slate-100 text-xs text-slate-400 font-bold text-right">
            Total Siswa: {filteredStudents.length}
        </div>
       </div>
    </div>
  );
};