import React from 'react';
import { useAppContext } from '../../lib/AppContext';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Komponen modal global yang dikendalikan oleh AppContext.
 * Digunakan untuk menampilkan peringatan (alert) atau konfirmasi (confirm) di seluruh aplikasi.
 * 
 * @returns {JSX.Element | null} Elemen modal yang dirender atau null jika modal tidak terbuka.
 */
export const GlobalModal: React.FC = () => {
  const { modal, closeModal } = useAppContext();

  if (!modal.isOpen) return null;

  const getIcon = () => {
    if (modal.variant === 'danger') return <AlertTriangle size={40} className="text-cardinal" />;
    if (modal.variant === 'success') return <CheckCircle size={40} className="text-feather" />;
    return <Info size={40} className="text-macaw" />;
  };

  const getHeaderColor = () => {
    if (modal.variant === 'danger') return 'bg-red-50 border-red-100 text-cardinal';
    if (modal.variant === 'success') return 'bg-green-50 border-green-100 text-feather-dark';
    return 'bg-blue-50 border-blue-100 text-macaw-dark';
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-slate-200">
        
        {/* Header Visual */}
        <div className={`p-6 flex flex-col items-center justify-center border-b-2 ${getHeaderColor()}`}>
           <div className="bg-white p-3 rounded-full shadow-sm mb-3">
              {getIcon()}
           </div>
           <h3 className="text-xl font-extrabold text-center leading-tight">
             {modal.title}
           </h3>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
           <p className="text-slate-500 font-bold text-sm leading-relaxed whitespace-pre-line">
             {modal.message}
           </p>
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-slate-50 border-t-2 border-slate-100 flex gap-3">
           {modal.type === 'confirm' ? (
             <>
                <Button 
                  onClick={modal.onCancel} 
                  variant="outline" 
                  className="flex-1"
                >
                  {modal.cancelText || 'Batal'}
                </Button>
                <Button 
                  onClick={modal.onConfirm} 
                  variant={modal.variant === 'danger' ? 'danger' : 'primary'}
                  className="flex-1"
                >
                  {modal.confirmText || 'Ya, Lanjutkan'}
                </Button>
             </>
           ) : (
             <Button 
                onClick={closeModal} 
                variant={modal.variant === 'danger' ? 'danger' : 'primary'} 
                className="w-full"
             >
                OK, Mengerti
             </Button>
           )}
        </div>
        
        {/* Close Button X (Top Right) */}
        <button 
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

      </div>
    </div>
  );
};