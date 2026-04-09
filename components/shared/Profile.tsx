import React, { useState } from 'react';
import { supabase, UserData, AvatarConfig } from '../../lib/supabase';
import { Button } from './Button';
import { User, Save, Loader2, Mail, Lock, Calendar, Edit2, Check, GraduationCap } from 'lucide-react';
import { Avatar, AVATAR_OPTIONS } from './Avatar';

interface ProfileProps {
  userData: UserData;
  onUpdate: () => void;
}

/**
 * Komponen Profil untuk menampilkan dan mengedit informasi pengguna, avatar, dan kata sandi.
 * 
 * @param {ProfileProps} props - Properti komponen Profil.
 * @param {UserData} props.userData - Data pengguna saat ini.
 * @param {() => void} props.onUpdate - Fungsi callback yang dipanggil setelah profil berhasil diperbarui.
 * @returns {JSX.Element} Elemen profil yang dirender.
 */
export const Profile: React.FC<ProfileProps> = ({ userData, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<'info' | 'avatar' | 'security'>('info');
  const [username, setUsername] = useState(userData.username || '');
  const [grade, setGrade] = useState(userData.grade || '8');
  const [tempAvatar, setTempAvatar] = useState<AvatarConfig>(userData.avatar_config || { bgColor: '#58cc02', eyes: 0, mouth: 0 });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  /**
   * Menangani penyimpanan informasi dasar (username, kelas).
   * @param {React.FormEvent} e - Event form submit.
   */
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('users_data').update({ username, grade }).eq('id', userData.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Informasi berhasil diupdate!' });
      onUpdate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menangani penyimpanan konfigurasi avatar baru.
   */
  const handleSaveAvatar = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('users_data').update({ avatar_config: tempAvatar }).eq('id', userData.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Avatar kerenmu tersimpan!' });
      onUpdate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menangani perubahan kata sandi pengguna.
   * @param {React.FormEvent} e - Event form submit.
   */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
        return;
    }
    if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
        return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;
      const { error: dbError } = await supabase.from('users_data').update({ password_plain: newPassword }).eq('id', userData.id);
      if (dbError) throw dbError;
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const joinDate = userData.created_at 
    ? new Date(userData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20">
      <h2 className="text-3xl font-extrabold text-slate-700 mb-8">Profil Kamu</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                <Avatar config={userData.avatar_config} size={120} className="mb-4" />
                <h3 className="text-xl font-extrabold text-slate-700">{userData.username}</h3>
                <div className="flex items-center gap-2 mb-4">
                     <span className="text-slate-400 font-bold uppercase text-xs">{userData.role}</span>
                     <span className="text-slate-300 text-[10px]">•</span>
                     <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Kelas {userData.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                    <Calendar size={16} />
                    <span>Sejak {joinDate}</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                <button 
                    onClick={() => setActiveSection('info')}
                    className={`p-4 rounded-2xl text-left font-bold border-2 border-b-4 transition-all ${activeSection === 'info' ? 'bg-macaw text-white border-macaw-dark' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <User size={20} className="inline mr-2 mb-1" /> Info Dasar
                </button>
                <button 
                    onClick={() => setActiveSection('avatar')}
                    className={`p-4 rounded-2xl text-left font-bold border-2 border-b-4 transition-all ${activeSection === 'avatar' ? 'bg-macaw text-white border-macaw-dark' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Edit2 size={20} className="inline mr-2 mb-1" /> Edit Avatar
                </button>
                <button 
                    onClick={() => setActiveSection('security')}
                    className={`p-4 rounded-2xl text-left font-bold border-2 border-b-4 transition-all ${activeSection === 'security' ? 'bg-macaw text-white border-macaw-dark' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Lock size={20} className="inline mr-2 mb-1" /> Password
                </button>
            </nav>
        </div>

        <div className="md:col-span-2">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm min-h-[400px]">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border-2 font-bold text-center ${message.type === 'success' ? 'bg-feather-light/20 border-feather text-feather-dark' : 'bg-cardinal-light/20 border-cardinal text-cardinal'}`}>
                        {message.text}
                    </div>
                )}
                {activeSection === 'info' && (
                    <form onSubmit={handleSaveInfo} className="space-y-6">
                        <h3 className="text-xl font-extrabold text-slate-700 border-b-2 border-slate-100 pb-4">Info Dasar</h3>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-2">Email</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-xl border-2 border-slate-200 text-slate-500 font-bold">
                                <Mail size={20} />
                                {userData.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-2">Username</label>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-macaw focus:ring-0 outline-none font-bold text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-2">Kelas</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select 
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-macaw focus:ring-0 outline-none font-bold text-slate-700 appearance-none"
                                >
                                    <option value="7">Kelas 7 SMP</option>
                                    <option value="8">Kelas 8 SMP</option>
                                    <option value="9">Kelas 9 SMP</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">▼</div>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={loading} icon={loading ? <Loader2 className="animate-spin"/> : <Save />}>
                                SIMPAN
                            </Button>
                        </div>
                    </form>
                )}
                {activeSection === 'avatar' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                            <h3 className="text-xl font-extrabold text-slate-700">Edit Avatar</h3>
                            <div className="bg-slate-50 p-2 rounded-2xl border-2 border-slate-200">
                                <Avatar config={tempAvatar} size={80} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-3">Warna Background</label>
                            <div className="flex flex-wrap gap-3">
                                {AVATAR_OPTIONS.colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setTempAvatar({...tempAvatar, bgColor: color})}
                                        className={`w-10 h-10 rounded-full border-4 transition-transform active:scale-95 ${tempAvatar.bgColor === color ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-3">Mata</label>
                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: AVATAR_OPTIONS.eyes }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTempAvatar({...tempAvatar, eyes: i})}
                                        className={`w-14 h-14 bg-slate-100 rounded-xl border-2 flex items-center justify-center hover:bg-slate-200 ${tempAvatar.eyes === i ? 'border-macaw bg-macaw-light/20' : 'border-slate-200'}`}
                                    >
                                        <div className="scale-50">
                                            <Avatar config={{...tempAvatar, eyes: i, bgColor: 'transparent'}} size={60} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-3">Mulut</label>
                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: AVATAR_OPTIONS.mouths }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTempAvatar({...tempAvatar, mouth: i})}
                                        className={`w-14 h-14 bg-slate-100 rounded-xl border-2 flex items-center justify-center hover:bg-slate-200 ${tempAvatar.mouth === i ? 'border-macaw bg-macaw-light/20' : 'border-slate-200'}`}
                                    >
                                        <div className="scale-50 mt-2">
                                            <Avatar config={{...tempAvatar, mouth: i, bgColor: 'transparent'}} size={60} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                             <Button onClick={handleSaveAvatar} disabled={loading} icon={loading ? <Loader2 className="animate-spin"/> : <Check />}>
                                TERAPKAN
                            </Button>
                        </div>
                    </div>
                )}
                {activeSection === 'security' && (
                    <form onSubmit={handleSavePassword} className="space-y-6">
                        <h3 className="text-xl font-extrabold text-slate-700 border-b-2 border-slate-100 pb-4">Ganti Password</h3>
                        <div className="bg-bee-light/20 border-2 border-bee text-bee-dark p-4 rounded-xl text-sm font-bold mb-4">
                            Perhatian: Mengganti password akan memutus sesi login di perangkat lain.
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-2">Password Baru</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-macaw focus:ring-0 outline-none font-bold text-slate-700"
                                placeholder="Minimal 6 karakter"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 font-bold uppercase text-xs mb-2">Konfirmasi Password Baru</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-0 outline-none font-bold text-slate-700 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-cardinal' : 'border-slate-200 focus:border-macaw'}`}
                                placeholder="Ketik ulang password baru"
                            />
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-cardinal font-bold mt-1">Password tidak cocok</p>
                            )}
                        </div>
                        <div className="pt-4 flex justify-end">
                             <Button type="submit" disabled={loading || !newPassword || newPassword !== confirmPassword} variant="danger" icon={loading ? <Loader2 className="animate-spin"/> : <Lock />}>
                                GANTI PASSWORD
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};