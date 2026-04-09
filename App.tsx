import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './services/supabase'; 
import { AppProvider, useAppContext } from './lib/AppContext';
import { Sidebar } from './components/shared/Sidebar';
import { StudentDashboard } from './components/siswa/StudentDashboard'; 
import { Login } from './components/shared/Auth/Login';
import { Register } from './components/shared/Auth/Register';
import { RegisterSuccess } from './components/shared/Auth/RegisterSuccess';
import { StudentManagement } from './components/guru/StudentManagement';
import { GameMonitor } from './components/guru/GameMonitor';
import { Statistics } from './components/guru/Statistics';
import { ActivityLogManager } from './components/guru/ActivityLogManager'; 
import { TeacherDashboard } from './components/guru/TeacherDashboard'; // Import New Dashboard
import { Forum } from './components/shared/Forum';
import { Profile } from './components/shared/Profile';
import { Leaderboard } from './components/shared/Leaderboard';
import { LogiChat } from './components/siswa/LogiChat'; 
import { MazeWrapper, AdventureWrapper, LearnWrapper } from './views/student/GameWrappers'; 
import { PracticeZone } from './views/student/PracticeZone'; 
import { CURRICULUM_DATA } from './data/curriculum'; 
import { GlobalModal } from './components/shared/GlobalModal'; 
import { Menu, Loader2, XCircle, CheckCircle, Info } from 'lucide-react';

// --- TOAST COMPONENT (Shared UI) ---
const ToastDisplay = () => {
  const { toast } = useAppContext();
  if (!toast) return null;

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: <CheckCircle className="text-white" size={20} />,
    error: <XCircle className="text-white" size={20} />,
    info: <Info className="text-white" size={20} />
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-white font-bold text-sm">{toast.message}</span>
    </div>
  );
};

// --- MAIN CONTROLLER COMPONENT ---
const AppContent: React.FC = () => {
  const { session, userData, isLoading, setSession, setUserData, setLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register' | 'success'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('users_data').select('*').eq('id', userId).single();
      if (error) throw error;
      if (data) setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserData(null);
    setAuthView('login');
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-feather" size={48} />
      </div>
    );
  }

  // --- AUTH FLOW ---
  if (!session || !userData) {
    if (authView === 'login') return <Login onLoginSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setAuthView('register')} />;
    if (authView === 'register') return <Register onRegisterSuccess={() => setAuthView('success')} onSwitchToLogin={() => setAuthView('login')} />;
    if (authView === 'success') return <RegisterSuccess onGoToLogin={() => setAuthView('login')} />;
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setAuthView('register')} />;
  }

  // --- CONTENT ROUTING ---
  const renderContent = () => {
    if (userData.role === 'guru') {
       switch(activeTab) {
           case 'dashboard': return <TeacherDashboard onNavigate={setActiveTab} />; // New Overview
           case 'students': return <StudentManagement />;
           case 'activities': return <ActivityLogManager />; 
           case 'games': return <GameMonitor />;
           case 'statistics': return <Statistics />;
           case 'leaderboard': return <Leaderboard />; 
           case 'forum': return <Forum currentUserId={userData.id} userRole="guru" />;
           case 'profile': return <Profile userData={userData} onUpdate={() => fetchUserData(userData.id)} />;
           default: return <TeacherDashboard onNavigate={setActiveTab} />;
       }
    } else {
        // SISWA ROUTING
        switch(activeTab) {
            case 'dashboard': return <StudentDashboard userData={userData} units={CURRICULUM_DATA} onNavigate={setActiveTab} />;
            case 'learn': return <LearnWrapper userData={userData} />;
            case 'chatbot': return <LogiChat />;
            case 'maze': return <MazeWrapper userData={userData} onBack={() => setActiveTab('dashboard')} />;
            case 'adventure': return <AdventureWrapper userData={userData} onBack={() => setActiveTab('dashboard')} />;
            case 'challenges': return <PracticeZone userData={userData} onBack={() => setActiveTab('dashboard')} />; 
            case 'leaderboard': return <Leaderboard />;
            case 'forum': return <Forum currentUserId={userData.id} userRole="siswa" />;
            case 'profile': return <Profile userData={userData} onUpdate={() => fetchUserData(userData.id)} />;
            default: return <StudentDashboard userData={userData} units={CURRICULUM_DATA} onNavigate={setActiveTab} />;
        }
    }
  };

  // Check if we are in a fullscreen game mode
  const isFullScreenGame = ['maze', 'adventure', 'challenges'].includes(activeTab);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 flex">
        <ToastDisplay />
        <GlobalModal /> {/* Mount Global Modal Here */}
        
        {/* HIDE SIDEBAR ON FULLSCREEN GAMES */}
        {!isFullScreenGame && (
          <Sidebar 
              userData={userData} 
              activeTab={activeTab} 
              onNavigate={setActiveTab}
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              onLogout={handleLogout}
          />
        )}

        <main className={`flex-1 relative overflow-x-hidden min-h-screen transition-all duration-300 ${isFullScreenGame ? 'p-0' : ''}`}>
            {/* Mobile Header (Hide on Fullscreen Game) */}
            {!isFullScreenGame && (
              <div className="md:hidden p-4 bg-white border-b-2 border-slate-200 flex items-center gap-3 sticky top-0 z-10">
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg"><Menu size={20} /></button>
                  <span className="font-extrabold text-feather text-lg">Logi Math</span>
              </div>
            )}

            {renderContent()}
        </main>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </QueryClientProvider>
);

export default App;