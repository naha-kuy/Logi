import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../Button';
import { Eye, EyeOff, Lock, Mail, User, Loader2, GraduationCap } from 'lucide-react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

/**
 * Komponen form registrasi untuk pengguna baru.
 * Menangani pembuatan akun baru menggunakan Supabase dan menyimpan data profil awal.
 * 
 * @param {RegisterProps} props - Properti komponen Register.
 * @param {() => void} props.onRegisterSuccess - Callback yang dipanggil saat registrasi berhasil.
 * @param {() => void} props.onSwitchToLogin - Callback untuk beralih ke tampilan login.
 * @returns {JSX.Element} Elemen form registrasi yang dirender.
 */
export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('8'); // Default Kelas 8
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Gagal membuat user.');
      const { error: dbError } = await supabase.from('users_data').insert({
        id: authData.user.id,
        email: email,
        username: username,
        role: 'siswa',
        grade: grade, // Simpan Kelas
        password_plain: password,
        level: 1,
        exp: 0,
        streak: 0,
        completed_lessons: [],
        is_active: true,
        avatar_config: { bgColor: '#58cc02', eyes: 0, mouth: 0 } 
      });
      if (dbError) throw dbError;
      onRegisterSuccess();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-feather mb-2">Buat Akun</h1>
          <p className="text-slate-400 font-bold">Gabung Logi Math sekarang!</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-cardinal text-sm font-bold rounded-xl border-2 border-red-100 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400" placeholder="Username" />
            </div>
          </div>
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400" placeholder="Email" />
            </div>
          </div>
          <div>
             <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select 
                    value={grade} 
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 appearance-none"
                >
                    <option value="7">Kelas 7 SMP</option>
                    <option value="8">Kelas 8 SMP</option>
                    <option value="9">Kelas 9 SMP</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">▼</div>
             </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400" placeholder="Password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full pl-12 pr-12 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400 ${password && confirmPassword && password !== confirmPassword ? 'border-cardinal' : 'border-slate-200 focus:border-macaw'}`} placeholder="Konfirmasi Password" />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-cardinal font-bold mt-1 ml-2">Password tidak cocok</p>
            )}
          </div>
          <Button type="submit" variant="primary" className="w-full" size="lg" disabled={loading || (password !== confirmPassword)}>
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'BUAT AKUN'}
          </Button>
        </form>
        <div className="mt-8 text-center text-sm font-bold text-slate-400">
          Sudah punya akun?{' '}
          <button onClick={onSwitchToLogin} className="text-macaw hover:text-macaw-light uppercase tracking-wide">
            MASUK
          </button>
        </div>
      </div>
    </div>
  );
};