import React from 'react';
import { Button } from '../Button';
import { CheckCircle } from 'lucide-react';

interface RegisterSuccessProps {
  onGoToLogin: () => void;
}

/**
 * Komponen tampilan sukses setelah registrasi berhasil.
 * Memberikan instruksi kepada pengguna untuk memverifikasi email mereka.
 * 
 * @param {RegisterSuccessProps} props - Properti komponen RegisterSuccess.
 * @param {() => void} props.onGoToLogin - Callback untuk kembali ke halaman login.
 * @returns {JSX.Element} Elemen tampilan sukses registrasi yang dirender.
 */
export const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-feather-light/30 rounded-full flex items-center justify-center text-feather">
                <CheckCircle size={60} strokeWidth={3} />
            </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-700 mb-4">Akun Terdaftar!</h1>
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-slate-600 font-bold mb-2">Langkah Terakhir:</p>
            <p className="text-slate-500 text-sm leading-relaxed">
                Kami telah mengirimkan tautan verifikasi ke email Anda. 
                Silakan cek kotak masuk (atau folder spam) dan klik tautan tersebut untuk mengaktifkan akun Anda.
            </p>
        </div>
        <Button onClick={onGoToLogin} variant="primary" className="w-full" size="lg">
            LANJUT KE HALAMAN LOGIN
        </Button>
      </div>
    </div>
  );
};