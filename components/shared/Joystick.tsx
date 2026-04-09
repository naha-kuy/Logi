import React, { useRef, useState } from 'react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  onStop: () => void;
}

/**
 * Komponen Joystick virtual untuk kontrol pergerakan pada perangkat sentuh.
 * Hanya ditampilkan pada layar berukuran kecil (mobile).
 * 
 * @param {JoystickProps} props - Properti komponen Joystick.
 * @param {(vector: { x: number; y: number }) => void} props.onMove - Fungsi yang dipanggil saat joystick digerakkan. Menerima vektor arah (x, y) yang dinormalisasi (-1 hingga 1).
 * @param {() => void} props.onStop - Fungsi yang dipanggil saat joystick dilepas.
 * @returns {JSX.Element} Elemen joystick yang dirender.
 */
export const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const radius = 50; 

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updatePosition(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  };

  const updatePosition = (touch: React.Touch) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    let x = deltaX;
    let y = deltaY;
    
    if (distance > radius) {
      const angle = Math.atan2(deltaY, deltaX);
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    }

    setPosition({ x, y });
    onMove({
      x: x / radius,
      y: y / radius
    });
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 md:hidden select-none touch-none">
      <div 
        ref={containerRef}
        className="w-32 h-32 bg-slate-900/40 backdrop-blur-md rounded-full border-2 border-white/20 relative shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div 
          className={`w-14 h-14 bg-white rounded-full absolute top-1/2 left-1/2 -ml-7 -mt-7 shadow-xl transition-transform ${isDragging ? 'duration-0' : 'duration-200'}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px)` 
          }}
        >
          <div className="absolute inset-3 border-2 border-slate-200 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
};