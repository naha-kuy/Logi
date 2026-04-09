import React from 'react';
import { Clock, Star } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string; 
}

/**
 * Komponen halaman placeholder untuk fitur yang belum tersedia (Segera Hadir).
 * 
 * @param {PlaceholderPageProps} props - Properti komponen.
 * @param {string} props.title - Judul halaman utama.
 * @param {string} props.subtitle - Subjudul yang menjelaskan fitur.
 * @param {string} props.description - Deskripsi detail tentang fitur yang akan datang.
 * @param {React.ReactNode} props.icon - Ikon yang merepresentasikan fitur.
 * @param {string} props.themeColor - Kelas warna Tailwind untuk tema halaman (misal: 'bg-blue-500').
 * @returns {JSX.Element} Elemen halaman placeholder yang dirender.
 */
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  description,
  icon,
  themeColor
}) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center mb-8 border-b-8 shadow-xl ${themeColor} bg-opacity-20 border-opacity-40`}>
        <div className={`transform scale-150 ${themeColor.replace('bg-', 'text-').replace('/20', '')}`}>
            {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full font-extrabold uppercase text-xs tracking-widest mb-6">
        <Clock size={14} />
        <span>Segera Hadir</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-700 mb-2">
        {title}
      </h1>
      <h2 className={`text-xl font-bold mb-6 ${themeColor.replace('bg-', 'text-').replace('/20', '')}`}>
        {subtitle}
      </h2>
      <p className="text-slate-400 font-bold text-lg max-w-md leading-relaxed">
        {description}
      </p>
      <div className="absolute top-1/4 left-1/4 text-yellow-400 opacity-20 animate-pulse">
        <Star size={40} fill="currentColor" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 text-yellow-400 opacity-20 animate-pulse delay-700">
        <Star size={24} fill="currentColor" />
      </div>
    </div>
  );
};