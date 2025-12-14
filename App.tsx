
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Progress } from './components/Progress';
import { AIChat } from './components/AIChat';
import { AdminPanel } from './components/AdminPanel';
import { WorldDashboard } from './components/WorldDashboard';
import { Agenda } from './components/Agenda';
import { Login } from './components/Login'; // NEW IMPORT
import { INITIAL_USER } from './services/mockData';
import { User, WorkoutSession, Badge, UserRole, DailyLog } from './types';
import { Dumbbell } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [isWorldMode, setIsWorldMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // NEW AUTH STATE

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartWorkout = () => {
    setShowActiveWorkout(true);
  };

  const handleFinishWorkout = (session: WorkoutSession, earnedXP: number, newBadges: Badge[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setUser(prev => {
        const newXP = prev.currentXP + earnedXP;
        const newLevel = Math.floor(newXP / 1000) + 1;
        
        // Update Daily Log
        const currentLog = prev.dailyLogs.find(l => l.date === todayStr) || { date: todayStr, mealsEaten: [], cardioDone: false };
        const updatedLog: DailyLog = { ...currentLog, workoutCompletedId: session.id };
        const otherLogs = prev.dailyLogs.filter(l => l.date !== todayStr);

        return {
            ...prev,
            history: [session, ...prev.history],
            currentXP: newXP,
            level: newLevel,
            badges: [...prev.badges, ...newBadges],
            dailyLogs: [...otherLogs, updatedLog]
        };
    });
    
    setShowActiveWorkout(false);
    setActiveTab('dashboard');
  };

  const handleCancelWorkout = () => {
    if (window.confirm("¿Terminar sesión actual? Se perderá el progreso de hoy.")) {
        setShowActiveWorkout(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
  };

  const handleLogin = (email: string) => {
      setIsAuthenticated(true);
      if (email.toLowerCase() === 'ed.sanhuezag@gmail.com') {
          // Confirming it is the test user (Data is already in MockData, but we double check here if needed)
          setUser(prev => ({
              ...prev,
              email: email,
              username: 'Ed Sanhueza'
          }));
      } else {
          // For other emails, just update the email field in the mock user
          setUser(prev => ({
              ...prev,
              email: email,
              username: email.split('@')[0]
          }));
      }
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-dark-950"></div>
         <div className="relative z-10 flex flex-col items-center animate-fade-in px-6">
             <div className="mb-8 relative flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-brand-500 blur-[80px] opacity-20 rounded-full"></div>
                
                {/* CSS LOGO FOR LOADING SCREEN */}
                <div className="flex flex-col items-center relative z-10 scale-125">
                    <Dumbbell className="text-brand-500 mb-2 animate-pulse" size={48} />
                    <h1 className="text-5xl font-black text-white italic tracking-tighter">
                        MUSCLE<span className="text-brand-500">PRO</span>
                    </h1>
                    <span className="text-xs tracking-[0.5em] text-gray-400 mt-2 font-bold">PERFORMANCE</span>
                </div>
             </div>
             
             <div className="w-48 h-1 bg-dark-800 rounded-full overflow-hidden mt-8">
                 <div className="h-full bg-brand-500 animate-[loading_2s_ease-in-out_infinite]" style={{width: '30%'}}></div>
             </div>
             <p className="text-dark-500 text-[10px] tracking-[0.4em] uppercase mt-4 font-bold">Cargando Sistema...</p>
         </div>
         <style>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
            }
         `}</style>
      </div>
    )
  }

  // AUTH GUARD
  if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
  }

  // MODE: WORLD RPG
  if (isWorldMode) {
      return (
          <WorldDashboard 
              user={user} 
              onUpdateUser={handleUserUpdate} 
              onExit={() => setIsWorldMode(false)}
          />
      );
  }

  // MODE: WORKOUT PLAYER
  if (showActiveWorkout) {
    return (
      <ActiveWorkout 
          user={user} 
          onFinish={handleFinishWorkout}
          onCancel={handleCancelWorkout}
      />
    );
  }

  // MODE: CORE APP
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onStartWorkout={handleStartWorkout} onUpdateUser={handleUserUpdate} />;
      case 'progress':
        return <Progress user={user} />;
      case 'workout':
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-light text-white">Protocolo <span className="font-bold">Actual</span></h2>
                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                     <h3 className="text-xl font-bold text-white mb-2">{user.currentPlan?.name}</h3>
                     <p className="text-dark-500 text-sm mb-6">{user.currentPlan?.description}</p>
                     <div className="space-y-3">
                         {user.currentPlan?.exercises.map((ex, i) => (
                             <div key={i} className="flex justify-between items-center py-3 border-b border-dark-800 last:border-0">
                                 <span className="text-gray-300 font-medium">{ex.name}</span>
                                 <span className="text-brand-500 font-mono text-sm">{ex.sets} x {ex.reps}</span>
                             </div>
                         ))}
                     </div>
                     <button 
                        onClick={handleStartWorkout}
                        className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                     >
                         INICIAR SESIÓN
                     </button>
                </div>
            </div>
        );
      case 'agenda':
        return <Agenda user={user} onUpdateUser={handleUserUpdate} />;
      case 'ai-chat':
        return <AIChat user={user} />;
      case 'admin':
        return <AdminPanel user={user} onUpdateUser={handleUserUpdate} />;
      case 'profile':
        return (
            <div className="space-y-6">
                <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-dark-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 border border-dark-700 text-white font-bold">
                            {user.username.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                        <p className="text-dark-500">{user.email}</p>
                        <button 
                            onClick={() => {
                                setUser(prev => ({ ...prev, role: prev.role === UserRole.CLIENT ? UserRole.ADMIN : UserRole.CLIENT }));
                                alert(`Rol cambiado a ${user.role === UserRole.CLIENT ? 'Admin' : 'Cliente'}`);
                            }}
                            className="mt-6 text-xs border border-dark-700 px-4 py-2 rounded-full text-dark-400 hover:text-white hover:border-white transition-colors"
                        >
                            Cambiar Rol (Dev)
                        </button>
                    </div>
                </div>
            </div>
        );
      default:
        return <Dashboard user={user} onStartWorkout={handleStartWorkout} onUpdateUser={handleUserUpdate} />;
    }
  };

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={() => {
            setIsAuthenticated(false);
            window.location.reload();
        }}
        userRole={user.role}
        onEnterWorld={() => setIsWorldMode(true)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
