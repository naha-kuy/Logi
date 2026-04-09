import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserData } from './supabase';

interface GameMode {
  type: string;
  active: boolean;
  mode?: 'solo' | 'coop' | 'duel';
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Interface untuk Modal
interface ModalConfig {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  variant: 'default' | 'danger' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AppContextType {
  session: Session | null;
  userData: UserData | null;
  isLoading: boolean;
  gameMode: GameMode;
  toast: ToastMessage | null;
  modal: ModalConfig; // State Modal
  
  setSession: (session: Session | null) => void;
  setUserData: (data: UserData | null) => void;
  setLoading: (loading: boolean) => void;
  setGameMode: (mode: GameMode) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Fungsi untuk memicu Modal
  showAlert: (title: string, message: string, variant?: 'default' | 'danger' | 'success') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, variant?: 'default' | 'danger') => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provider komponen untuk AppContext.
 * Membungkus aplikasi dan menyediakan state global serta fungsi-fungsi utilitas
 * seperti manajemen sesi, data pengguna, notifikasi toast, dan modal konfirmasi.
 * 
 * @param {object} props - Properti komponen AppProvider.
 * @param {ReactNode} props.children - Komponen anak yang akan memiliki akses ke context.
 * @returns {JSX.Element} Elemen provider context.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>({ type: '', active: false });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Modal State Initial
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    variant: 'default'
  });

  /**
   * Menampilkan pesan toast sementara di layar.
   * @param {string} message - Pesan yang akan ditampilkan.
   * @param {'success' | 'error' | 'info'} [type='info'] - Jenis toast.
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => prev?.id === id ? null : prev);
    }, 3000);
  }, []);

  /**
   * Menampilkan modal alert dengan satu tombol aksi.
   * @param {string} title - Judul modal.
   * @param {string} message - Pesan modal.
   * @param {'default' | 'danger' | 'success'} [variant='default'] - Varian tampilan modal.
   */
  const showAlert = useCallback((title: string, message: string, variant: 'default' | 'danger' | 'success' = 'default') => {
    setModal({
      isOpen: true,
      type: 'alert',
      title,
      message,
      variant
    });
  }, []);

  /**
   * Menampilkan modal konfirmasi dengan tombol Ya dan Batal.
   * @param {string} title - Judul modal.
   * @param {string} message - Pesan modal.
   * @param {() => void} onConfirm - Fungsi yang dipanggil saat konfirmasi.
   * @param {'default' | 'danger'} [variant='default'] - Varian tampilan modal.
   */
  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, variant: 'default' | 'danger' = 'default') => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      variant,
      onConfirm: () => {
        onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  /**
   * Menutup modal yang sedang terbuka.
   */
  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AppContext.Provider value={{
      session,
      userData,
      isLoading,
      gameMode,
      toast,
      modal,
      setSession,
      setUserData,
      setLoading,
      setGameMode,
      showToast,
      showAlert,
      showConfirm,
      closeModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook kustom untuk mengakses AppContext.
 * Harus digunakan di dalam komponen yang dibungkus oleh AppProvider.
 * 
 * @returns {AppContextType} Nilai dari AppContext yang berisi state dan fungsi global.
 * @throws {Error} Jika digunakan di luar AppProvider.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};