import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../Button';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

/**
 * Komponen form login untuk pengguna.
 * Menangani proses autentikasi menggunakan Supabase.
 * 
 * @param {LoginProps} props - Properti komponen Login.
 * @param {() => void} props.onLoginSuccess - Callback yang dipanggil saat login berhasil.
 * @param {() => void} props.onSwitchToRegister - Callback untuk beralih ke tampilan registrasi.
 * @returns {JSX.Element} Elemen form login yang dirender.
 */
export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes('Invalid login credentials')) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else {
        setError(msg || 'Gagal login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-feather mb-2">Selamat Datang!</h1>
          <p className="text-slate-400 font-bold">Lanjutkan progres belajar matematikamu.</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-cardinal text-sm font-bold rounded-xl border-2 border-red-100 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400"
                placeholder="Email atau Username"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-macaw focus:ring-0 outline-none transition-all font-bold text-slate-700 placeholder-slate-400"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'MASUK'}
          </Button>
        </form>
        <div className="mt-8 text-center text-sm font-bold text-slate-400">
          Belum punya akun?{' '}
          <button onClick={onSwitchToRegister} className="text-macaw hover:text-macaw-light uppercase tracking-wide">
            BUAT AKUN
          </button>
        </div>
      </div>
    </div>
  );
};