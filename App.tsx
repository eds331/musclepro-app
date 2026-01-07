
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Progress } from './components/Progress';
import { AdminPanel } from './components/AdminPanel';
import { Agenda } from './components/Agenda';
import { Login } from './components/Login';
import { INITIAL_USER } from './services/mockData';
import { User, WorkoutSession, Badge, DailyLog } from './types';
import { Dumbbell, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'musclepro_v3_master';
const AUTH_KEY = 'musclepro_v3_auth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const sessionActive = localStorage.getItem(AUTH_KEY);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUser(parsed);
      } catch (e) {
        console.error("Error recuperando datos guardados", e);
      }
    }

    if (sessionActive === 'true') {
      setIsAuthenticated(true);
    }

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Guardar datos en cada cambio de usuario (Persistencia Total)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isAuthenticated]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    if (email.toLowerCase() === 'ed.sanhuezag@gmail.com') {
      setUser(prev => ({ ...prev, email, username: 'Ed Sanhueza', role: 'ADMIN' as any }));
    } else {
      setUser(prev => ({ ...prev, email, username: email.split('@')[0] }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  };

  const handleFinishWorkout = (session: WorkoutSession, earnedXP: number, newBadges: Badge[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setUser(prev => {
      const newXP = prev.currentXP + earnedXP;
      const newLevel = Math.floor(newXP / 1000) + 1;
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

  const handleUserUpdate = (updatedUser: User) => setUser(updatedUser);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
         <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full animate-pulse"></div>
            <Dumbbell className="text-brand-500 relative z-10 animate-bounce" size={64} />
         </div>
         <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
            MUSCLE<span className="text-brand-500">PRO</span>
         </h1>
         <div className="flex items-center gap-2 text-dark-500 text-[10px] font-bold tracking-[0.4em] uppercase">
            <Loader2 size={14} className="animate-spin" />
            Sincronizando Atleta
         </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;
  
  if (showActiveWorkout) return (
    <ActiveWorkout 
      user={user} 
      onFinish={handleFinishWorkout} 
      onCancel={() => setShowActiveWorkout(false)} 
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} onStartWorkout={() => setShowActiveWorkout(true)} onUpdateUser={handleUserUpdate} />;
      case 'progress': return <Progress user={user} />;
      case 'workout': return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-light text-white italic uppercase tracking-tighter">Tu Plan <span className="font-bold">Elite</span></h2>
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 shadow-xl">
                 <h3 className="text-2xl font-black text-white mb-1 italic tracking-tighter">{user.currentPlan?.name}</h3>
                 <p className="text-dark-500 text-xs font-bold uppercase tracking-widest mb-8">{user.currentPlan?.description}</p>
                 <div className="space-y-3">
                     {user.currentPlan?.exercises.map((ex, i) => (
                         <div key={i} className="flex justify-between items-center py-4 border-b border-dark-800/50 last:border-0 hover:bg-dark-800/10 px-2 rounded-lg transition-colors">
                             <span className="text-gray-200 font-bold text-sm uppercase tracking-wide">{ex.name}</span>
                             <span className="text-brand-500 font-mono font-black">{ex.sets} x {ex.reps}</span>
                         </div>
                     ))}
                 </div>
                 <button onClick={() => setShowActiveWorkout(true)} className="w-full mt-10 bg-white text-black font-black py-5 rounded-2xl hover:bg-brand-500 transition-all uppercase tracking-widest text-sm shadow-xl active:scale-95">
                     INICIAR SESIÓN AHORA
                 </button>
            </div>
        </div>
      );
      case 'agenda': return <Agenda user={user} onUpdateUser={handleUserUpdate} />;
      case 'admin': return <AdminPanel user={user} onUpdateUser={handleUserUpdate} />;
      case 'profile': return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-dark-900 border border-dark-800 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl">
                <div className="w-24 h-24 bg-dark-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 border-2 border-dark-700 text-brand-500 font-black shadow-inner">
                    {user.username.charAt(0)}
                </div>
                <h2 className="text-3xl font-black text-white mb-1 italic tracking-tighter uppercase">{user.username}</h2>
                <p className="text-dark-500 font-bold tracking-widest text-[10px] uppercase mb-8">{user.email}</p>
                <div className="pt-8 border-t border-dark-800 flex justify-center gap-10">
                    <div>
                        <div className="text-3xl font-black text-white italic tracking-tighter">{user.level}</div>
                        <div className="text-[9px] text-dark-500 uppercase font-black tracking-widest">Nivel</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white italic tracking-tighter">{user.history.length}</div>
                        <div className="text-[9px] text-dark-500 uppercase font-black tracking-widest">Sesiones</div>
                    </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="mt-12 text-red-500 text-[10px] font-black py-3 px-10 rounded-xl transition-all uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-500/10 active:scale-95"
                >
                  Cerrar Sesión
                </button>
            </div>
        </div>
      );
      default: return <Dashboard user={user} onStartWorkout={() => setShowActiveWorkout(true)} onUpdateUser={handleUserUpdate} />;
    }
  };

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        userRole={user.role}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
