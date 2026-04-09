import React from 'react';
import { AvatarConfig } from '../../types';

interface AvatarProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
}

/**
 * Komponen Avatar untuk menampilkan karakter pengguna yang dapat dikustomisasi.
 * Menggunakan SVG untuk merender wajah berdasarkan konfigurasi yang diberikan.
 * 
 * @param {AvatarProps} props - Properti komponen Avatar.
 * @param {AvatarConfig} [props.config] - Konfigurasi avatar (warna latar, mata, mulut).
 * @param {number} [props.size=60] - Ukuran avatar dalam piksel.
 * @param {string} [props.className=''] - Kelas CSS tambahan.
 * @returns {JSX.Element} Elemen avatar yang dirender.
 */
export const Avatar: React.FC<AvatarProps> = ({ 
  config = { bgColor: '#58cc02', eyes: 0, mouth: 0 }, 
  size = 60,
  className = ''
}) => {
  const { bgColor, eyes, mouth } = config || { bgColor: '#58cc02', eyes: 0, mouth: 0 };

  const renderEyes = (index: number) => {
    switch (index) {
      case 1: 
        return (
          <g fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round">
            <path d="M35 45 Q 45 40 55 45" />
            <path d="M65 45 Q 75 40 85 45" />
          </g>
        );
      case 2: 
        return (
          <g>
            <circle cx="45" cy="45" r="12" fill="white" stroke="#333" strokeWidth="3"/>
            <circle cx="75" cy="45" r="12" fill="white" stroke="#333" strokeWidth="3"/>
            <line x1="57" y1="45" x2="63" y2="45" stroke="#333" strokeWidth="3"/>
            <circle cx="45" cy="45" r="3" fill="#333"/>
            <circle cx="75" cy="45" r="3" fill="#333"/>
          </g>
        );
      case 3: 
        return (
           <g>
             <circle cx="45" cy="45" r="5" fill="#333"/>
             <path d="M65 45 Q 75 40 85 45" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round"/>
           </g>
        );
      case 4: 
        return (
           <g stroke="#333" strokeWidth="4" strokeLinecap="round">
             <line x1="35" y1="45" x2="55" y2="45" />
             <line x1="65" y1="45" x2="85" y2="45" />
           </g>
        );
      default: 
        return (
          <g fill="#333">
            <circle cx="45" cy="45" r="5" />
            <circle cx="75" cy="45" r="5" />
            <circle cx="47" cy="43" r="2" fill="white" />
            <circle cx="77" cy="43" r="2" fill="white" />
          </g>
        );
    }
  };

  const renderMouth = (index: number) => {
    switch (index) {
      case 1: return <path d="M40 70 Q 60 90 80 70" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />;
      case 2: return <circle cx="60" cy="75" r="8" fill="#333" />;
      case 3: return <path d="M40 80 Q 60 65 80 80" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />;
      case 4: return <line x1="45" y1="75" x2="75" y2="75" stroke="#333" strokeWidth="4" strokeLinecap="round" />;
      default: return <path d="M45 75 Q 60 85 75 75" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />;
    }
  };

  return (
    <div 
      className={`rounded-full overflow-hidden border-2 border-b-4 border-slate-200 shadow-sm ${className}`}
      style={{ width: size, height: size, backgroundColor: bgColor }}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%">
         <circle cx="30" cy="65" r="6" fill="rgba(0,0,0,0.1)" />
         <circle cx="90" cy="65" r="6" fill="rgba(0,0,0,0.1)" />
         {renderEyes(eyes)}
         {renderMouth(mouth)}
      </svg>
    </div>
  );
};

export const AVATAR_OPTIONS = {
  colors: ['#58cc02', '#1cb0f6', '#ff4b4b', '#ffc800', '#ce82ff', '#ff9600', '#7797b2'],
  eyes: 5, 
  mouths: 5
};