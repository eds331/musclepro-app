
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Progress } from './components/Progress';
import { AdminPanel } from './components/AdminPanel';
import { Agenda } from './components/Agenda';
import { Login } from './components/Login';
import { PersistenceService } from './services/persistenceService';
import { INITIAL_USER } from './services/mockData';
import { User, WorkoutSession, Badge, DailyLog, UserRole } from './types';
import { Dumbbell, Loader2, CloudCheck, CloudAlert, CloudLightning } from 'lucide-react';

const STORAGE_KEY = 'musclepro_v3_master_v2';
const AUTH_KEY = 'musclepro_v3_auth_v2';
const EMAIL_KEY = 'musclepro_v3_user_email';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. CARGA INICIAL: BUSCAR EN LA NUBE REAL
  useEffect(() => {
    const checkAuth = async () => {
      const sessionActive = localStorage.getItem(AUTH_KEY);
      const savedEmail = localStorage.getItem(EMAIL_KEY);
      
      if (sessionActive === 'true' && savedEmail) {
        setIsAuthenticated(true);
        // Prioridad 1: Intentar bajar de la nube real
        const cloudUser = await PersistenceService.loadFromCloud(savedEmail);
        if (cloudUser) {
          setUser(cloudUser);
        } else {
          // Prioridad 2: Si no hay nube (nuevo dispositivo), usar local
          const savedLocal = localStorage.getItem(STORAGE_KEY);
          if (savedLocal) setUser(JSON.parse(savedLocal));
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // 2. AUTO-GUARDADO GLOBAL (Cada vez que tocas algo)
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Guardado local (seguridad offline)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Sincronización Remota (Cloud Sync)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      syncTimeoutRef.current = setTimeout(async () => {
        setSyncStatus('syncing');
        const success = await PersistenceService.saveToCloud(user);
        setSyncStatus(success ? 'synced' : 'error');
      }, 1500); // Debounce de 1.5s para no saturar la red
    }
  }, [user, isAuthenticated, loading]);

  const handleLogin = async (email: string) => {
    setLoading(true);
    localStorage.setItem(EMAIL_KEY, email);
    
    // Al loguear, intentamos recuperar todo del servidor global
    const cloudUser = await PersistenceService.loadFromCloud(email);
    
    if (cloudUser) {
      setUser(cloudUser);
    } else {
      const newUser = { ...INITIAL_USER, email, username: email.split('@')[0] };
      if (email.toLowerCase() === 'ed.sanhuezag@gmail.com') {
        newUser.role = UserRole.ADMIN;
        newUser.username = 'Ed Sanhueza';
      }
      setUser(newUser);
      await PersistenceService.saveToCloud(newUser);
    }
    
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    setLoading(false);
  };

  const handleLogout = () => {
    if (confirm("Se cerrará la sesión. Tus datos están a salvo en la nube.")) {
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(EMAIL_KEY);
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
         <div className="relative mb-10">
            <div className="absolute inset-0 bg-brand-500/20 blur-[60px] animate-pulse rounded-full"></div>
            <Dumbbell className="text-brand-500 relative z-10 animate-bounce" size={64} />
         </div>
         <h1 className="text-4xl font-black text-white italic tracking-tighter mb-4">MUSCLE<span className="text-brand-500">PRO</span></h1>
         <div className="flex items-center gap-3 bg-dark-900 border border-dark-800 px-6 py-3 rounded-2xl">
            <Loader2 size={16} className="animate-spin text-brand-500" />
            <span className="text-[10px] text-dark-400 font-black uppercase tracking-[0.3em]">Sincronizando con Nube Global...</span>
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
        isSyncing={syncStatus === 'syncing'}
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
                <div className="w-24 h-24 bg-dark-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 border-2 border-dark-700 text-brand-500 font-black shadow-inner">
                    {user.username.charAt(0)}
                </div>
                <h2 className="text-3xl font-black text-white mb-1 italic tracking-tighter uppercase">{user.username}</h2>
                <p className="text-dark-500 font-bold tracking-widest text-[10px] uppercase mb-8">{user.email}</p>
                
                {/* STATUS DE NUBE REAL */}
                <div className={`flex items-center justify-center gap-2 mb-8 py-2 px-6 rounded-full w-fit mx-auto border transition-all ${
                  syncStatus === 'synced' ? 'bg-success-500/10 border-success-500/20 text-success-500' :
                  syncStatus === 'syncing' ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' :
                  'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    {syncStatus === 'synced' && <CloudCheck size={14} />}
                    {syncStatus === 'syncing' && <CloudLightning size={14} className="animate-pulse" />}
                    {syncStatus === 'error' && <CloudAlert size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {syncStatus === 'synced' ? 'Nube Global Conectada' : 
                       syncStatus === 'syncing' ? 'Actualizando Servidor...' : 
                       'Error de Sincronización'}
                    </span>
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

                <button onClick={handleLogout} className="w-full mt-12 text-red-500 text-[10px] font-black py-4 rounded-xl transition-all uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-500/10 active:scale-95">
                    Cerrar Sesión
                </button>
            </div>
            
            <div className="bg-dark-900 border border-dark-800 p-6 rounded-3xl">
                <h4 className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-4">Información de Red</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Tus datos ahora se sincronizan con un servidor central. Puedes abrir esta app en tu notebook y celular simultáneamente y verás los cambios reflejados al recargar o iniciar sesión.
                </p>
            </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
