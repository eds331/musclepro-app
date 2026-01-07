
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Progress } from './components/Progress';
import { AdminPanel } from './components/AdminPanel';
import { Agenda } from './components/Agenda';
import { Login } from './components/Login';
import { SyncCenter } from './components/SyncCenter';
import { PersistenceService } from './services/persistenceService';
import { INITIAL_USER } from './services/mockData';
import { User, WorkoutSession, Badge, DailyLog, UserRole } from './types';
// Import CloudCheck from lucide-react to fix line 186 error
import { Dumbbell, Loader2, CloudCheck } from 'lucide-react';

const STORAGE_KEY = 'musclepro_v3_master_v2';
const AUTH_KEY = 'musclepro_v3_auth_v2';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Ref para manejar el debounce del auto-guardado
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. CARGA INICIAL
  useEffect(() => {
    const checkAuth = async () => {
      const sessionActive = localStorage.getItem(AUTH_KEY);
      const savedLocal = localStorage.getItem(STORAGE_KEY);
      
      if (sessionActive === 'true' && savedLocal) {
        const localUser = JSON.parse(savedLocal) as User;
        setIsAuthenticated(true);
        // Intentar cargar la versión más fresca de la nube al iniciar
        const cloudUser = await PersistenceService.loadFromCloud(localUser.email);
        if (cloudUser) {
          setUser(cloudUser);
        } else {
          setUser(localUser);
        }
      }
      
      setTimeout(() => setLoading(false), 1500);
    };
    
    checkAuth();
  }, []);

  // 2. AUTO-GUARDADO AUTOMÁTICO (Debounced Cloud Sync)
  useEffect(() => {
    if (isAuthenticated) {
      // Guardado local inmediato
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Sincronización en la nube automática tras 2 segundos de inactividad
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      syncTimeoutRef.current = setTimeout(async () => {
        setIsSyncing(true);
        await PersistenceService.saveToCloud(user);
        setIsSyncing(false);
      }, 2000);
    }
  }, [user, isAuthenticated]);

  const handleLogin = async (email: string) => {
    setLoading(true);
    
    // Al loguear, buscamos primero en la nube
    const cloudUser = await PersistenceService.loadFromCloud(email);
    
    if (cloudUser) {
      setUser(cloudUser);
    } else {
      // Si es nuevo, inicializar con mock pero con su correo
      const newUser = { ...INITIAL_USER, email, username: email.split('@')[0] };
      if (email.toLowerCase() === 'ed.sanhuezag@gmail.com') {
        newUser.role = UserRole.ADMIN;
        newUser.username = 'Ed Sanhueza';
      }
      setUser(newUser);
    }
    
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    setLoading(false);
  };

  const handleLogout = () => {
    if (confirm("Se cerrará la sesión. Tus datos están sincronizados en la nube.")) {
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_KEY);
      window.location.reload();
    }
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
         <Dumbbell className="text-brand-500 mb-8 animate-bounce" size={64} />
         <h1 className="text-4xl font-black text-white italic mb-2">MUSCLE<span className="text-brand-500">PRO</span></h1>
         <div className="flex items-center gap-2 text-dark-500 text-[10px] font-bold tracking-[0.4em] uppercase">
            <Loader2 size={14} className="animate-spin" />
            Descargando Perfil Elite
         </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;
  
  if (showActiveWorkout) return (
    <ActiveWorkout user={user} onFinish={handleFinishWorkout} onCancel={() => setShowActiveWorkout(false)} />
  );

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        userRole={user.role}
        isSyncing={isSyncing}
    >
      {activeTab === 'dashboard' && <Dashboard user={user} onStartWorkout={() => setShowActiveWorkout(true)} onUpdateUser={handleUserUpdate} onNavigateToAdmin={() => setActiveTab('admin')} />}
      {activeTab === 'progress' && <Progress user={user} />}
      {activeTab === 'workout' && (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-light text-white italic uppercase tracking-tighter">Tu Plan <span className="font-bold">Elite</span></h2>
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 shadow-xl">
                 <h3 className="text-2xl font-black text-white mb-1 italic tracking-tighter">{user.currentPlan?.name}</h3>
                 <p className="text-dark-500 text-xs font-bold uppercase tracking-widest mb-8">{user.currentPlan?.description}</p>
                 <div className="space-y-3">
                     {user.currentPlan?.exercises.map((ex, i) => (
                         <div key={i} className="flex justify-between items-center py-4 border-b border-dark-800/50 last:border-0">
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
      )}
      {activeTab === 'agenda' && <Agenda user={user} onUpdateUser={handleUserUpdate} />}
      {activeTab === 'admin' && <AdminPanel user={user} onUpdateUser={handleUserUpdate} />}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-dark-900 border border-dark-800 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl">
                <div className="w-24 h-24 bg-dark-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 border-2 border-dark-700 text-brand-500 font-black">
                    {user.username.charAt(0)}
                </div>
                <h2 className="text-3xl font-black text-white mb-1 italic tracking-tighter uppercase">{user.username}</h2>
                <p className="text-dark-500 font-bold tracking-widest text-[10px] uppercase mb-8">{user.email}</p>
                
                <div className="flex items-center justify-center gap-2 mb-8 bg-brand-500/10 py-2 px-4 rounded-full w-fit mx-auto border border-brand-500/20">
                    <CloudCheck size={14} className="text-brand-500" />
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Sincronización Automática Activa</span>
                </div>

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

                <button onClick={handleLogout} className="w-full mt-12 text-red-500 text-[10px] font-black py-4 rounded-xl transition-all uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-500/10">
                    Cerrar Sesión
                </button>
            </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
