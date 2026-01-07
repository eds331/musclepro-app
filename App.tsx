
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
import { Dumbbell, Loader2, CloudCheck, CloudAlert, CloudLightning, Database, ShieldCheck, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'musclepro_v8_local_cache';
const AUTH_KEY = 'musclepro_v8_auth_session';
const EMAIL_KEY = 'musclepro_v8_user_email';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  // Flag crítico para evitar que useEffect de guardado corra antes de la carga
  const isInitialized = useRef(false);
  const syncTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. CARGA INICIAL: PULL ANTES QUE NADA
  useEffect(() => {
    const init = async () => {
      const email = localStorage.getItem(EMAIL_KEY);
      const auth = localStorage.getItem(AUTH_KEY);

      if (auth === 'true' && email) {
        setIsAuthenticated(true);
        // CARGA PRIORITARIA: Intentamos sincronizar con la nube de entrada
        const syncedUser = await PersistenceService.sync(user);
        setUser(syncedUser);
      }
      
      isInitialized.current = true;
      setLoading(false);
    };
    init();
  }, []);

  // 2. MOTOR DE AUTO-GUARDADO (PUSH)
  useEffect(() => {
    if (isAuthenticated && isInitialized.current && !loading) {
      // Guardado local instantáneo
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Guardado en la nube con Debounce (3 segundos de inactividad)
      if (syncTimer.current) clearTimeout(syncTimer.current);
      
      syncTimer.current = setTimeout(async () => {
        setSyncStatus('syncing');
        try {
            await PersistenceService.save(user);
            setSyncStatus('synced');
        } catch {
            setSyncStatus('error');
        }
      }, 3000);
    }
  }, [user, isAuthenticated, loading]);

  const handleLogin = async (email: string) => {
    setLoading(true);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(AUTH_KEY, 'true');

    // Al loguear, buscamos si tiene datos en la nube
    const cloudUser = await PersistenceService.sync({ ...INITIAL_USER, email });
    
    // Si la nube devolvió algo diferente al inicial, lo usamos
    if (cloudUser.email === email) {
        setUser(cloudUser);
    } else {
        const newUser = { ...INITIAL_USER, email, username: email.split('@')[0] };
        if (email.toLowerCase() === 'ed.sanhuezag@gmail.com') {
            newUser.role = UserRole.ADMIN;
            newUser.username = 'Ed Sanhueza';
        }
        setUser(newUser);
        await PersistenceService.save(newUser);
    }

    setIsAuthenticated(true);
    isInitialized.current = true;
    setLoading(false);
  };

  const handleLogout = () => {
    if (confirm("Se cerrará la sesión. Tus datos están guardados de forma segura en la nube.")) {
      setIsAuthenticated(false);
      localStorage.clear();
      window.location.reload();
    }
  }

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
         <div className="relative mb-12">
            <div className="absolute inset-0 bg-brand-500/20 blur-[120px] animate-pulse"></div>
            <Dumbbell className="text-brand-500 relative z-10 animate-spin-slow" size={60} />
         </div>
         <h1 className="text-3xl font-black text-white italic tracking-tighter mb-4">SINCRONIZANDO <span className="text-brand-500">NUBE</span></h1>
         <div className="flex items-center gap-3 bg-dark-900 border border-dark-800 px-6 py-3 rounded-2xl">
            <Loader2 size={16} className="animate-spin text-brand-500" />
            <span className="text-[10px] text-white font-black uppercase tracking-widest">Descargando Perfil Maestro...</span>
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
                <div className="w-24 h-24 bg-dark-800 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 border-2 border-dark-700 text-brand-500 font-black">
                    {user.username.charAt(0)}
                </div>
                <h2 className="text-3xl font-black text-white mb-1 italic tracking-tighter uppercase">{user.username}</h2>
                <p className="text-dark-500 font-bold tracking-widest text-[10px] uppercase mb-8">{user.email}</p>
                
                <div className={`flex items-center justify-center gap-2 mb-8 py-2.5 px-6 rounded-full w-fit mx-auto border transition-all ${
                  syncStatus === 'synced' ? 'bg-success-500/10 border-success-500/20 text-success-500' :
                  syncStatus === 'syncing' ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' :
                  'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    {syncStatus === 'synced' && <CloudCheck size={14} />}
                    {syncStatus === 'syncing' && <CloudLightning size={14} className="animate-pulse" />}
                    {syncStatus === 'error' && <CloudAlert size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {syncStatus === 'synced' ? 'Nube Protegida' : 
                       syncStatus === 'syncing' ? 'Sincronizando...' : 
                       'Fallo de Red'}
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
            
            <div className="bg-dark-900 border border-dark-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="text-brand-500" size={20} />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Estado de Base de Datos</h4>
                    </div>
                    <button 
                        onClick={async () => {
                            setSyncStatus('syncing');
                            const synced = await PersistenceService.sync(user);
                            setUser(synced);
                            setSyncStatus('synced');
                        }}
                        className="text-brand-500 p-2 hover:bg-brand-500/10 rounded-full transition-all"
                        title="Forzar actualización desde nube"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-dark-950 p-5 rounded-2xl border border-dark-800 flex items-center justify-between">
                      <div className="text-[9px] text-dark-500 uppercase font-black">ID en Servidor</div>
                      <div className="text-xs text-white font-mono">
                          {localStorage.getItem(`musclepro_v8_cloud_id_${user.email}`) || 'PENDIENTE'}
                      </div>
                  </div>
                  <div className="bg-dark-950 p-5 rounded-2xl border border-dark-800 flex items-center justify-between">
                      <div className="text-[9px] text-dark-500 uppercase font-black">Última Sincro</div>
                      <div className="text-xs text-brand-500 font-bold uppercase">
                          {new Date((user as any).syncTimestamp || Date.now()).toLocaleTimeString()}
                      </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl flex gap-3">
                    <ShieldCheck className="text-brand-500 shrink-0" size={18} />
                    <p className="text-[10px] text-dark-400 leading-relaxed italic">
                        Protección activa: El sistema detecta automáticamente si hay una versión más nueva de tu perfil en otro dispositivo y te la entregará al iniciar.
                    </p>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
