
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
import { Dumbbell, Loader2, CloudCheck, CloudAlert, CloudLightning, Wifi, Database } from 'lucide-react';

const STORAGE_KEY = 'musclepro_v7_local';
const AUTH_KEY = 'musclepro_v7_auth';
const EMAIL_KEY = 'musclepro_v7_email';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  // EL "BLOQUEO MAESTRO": Evita que la app guarde datos vacíos antes de descargar la nube
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. SECUENCIA DE ARRANQUE CRÍTICA
  useEffect(() => {
    const startup = async () => {
      const sessionActive = localStorage.getItem(AUTH_KEY);
      const savedEmail = localStorage.getItem(EMAIL_KEY);
      
      if (sessionActive === 'true' && savedEmail) {
        setIsAuthenticated(true);
        console.log("[App] Intentando descarga de Nube para:", savedEmail);
        
        const remoteData = await PersistenceService.loadFromCloud(savedEmail);
        if (remoteData) {
          console.log("[App] ✅ Sincronización con Nube Exitosa.");
          setUser(remoteData);
        } else {
          console.log("[App] ⚠️ No hay datos en nube, usando caché local.");
          const local = localStorage.getItem(STORAGE_KEY);
          if (local) setUser(JSON.parse(local));
        }
      }
      
      setIsDataLoaded(true);
      setLoading(false);
    };
    startup();
  }, []);

  // 2. MOTOR DE AUTO-SINCRO (Solo corre si isDataLoaded es TRUE)
  useEffect(() => {
    if (isAuthenticated && isDataLoaded && !loading) {
      // 1. Guardar local (inmediato)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // 2. Debounce para la nube (para no saturar la API)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      syncTimeoutRef.current = setTimeout(async () => {
        setSyncStatus('syncing');
        const success = await PersistenceService.saveToCloud(user);
        setSyncStatus(success ? 'synced' : 'error');
      }, 2500); 
    }
  }, [user, isAuthenticated, isDataLoaded, loading]);

  const handleLogin = async (email: string) => {
    setLoading(true);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(AUTH_KEY, 'true');
    
    // Al entrar, intentamos descargar de inmediato
    const remoteData = await PersistenceService.loadFromCloud(email);
    if (remoteData) {
      setUser(remoteData);
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
    setIsDataLoaded(true);
    setLoading(false);
  };

  const handleLogout = () => {
    if (confirm("Se cerrará la sesión. Tus datos están seguros en la nube global.")) {
      setIsAuthenticated(false);
      localStorage.clear();
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
         <div className="relative mb-12">
            <div className="absolute inset-0 bg-brand-500/30 blur-[100px] animate-pulse rounded-full"></div>
            <Dumbbell className="text-brand-500 relative z-10 animate-bounce" size={80} />
         </div>
         <h1 className="text-4xl font-black text-white italic tracking-tighter mb-8">MUSCLE<span className="text-brand-500">PRO</span></h1>
         <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 bg-dark-900 border border-dark-800 px-10 py-5 rounded-[2rem] shadow-2xl">
                <Loader2 size={24} className="animate-spin text-brand-500" />
                <div className="text-left">
                  <div className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Conexión Global Establecida</div>
                  <div className="text-[9px] text-dark-500 font-bold uppercase">Descargando Perfil Maestro...</div>
                </div>
            </div>
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
                
                {/* STATUS BAR DE NUBE */}
                <div className={`flex items-center justify-center gap-2 mb-8 py-2.5 px-6 rounded-full w-fit mx-auto border transition-all ${
                  syncStatus === 'synced' ? 'bg-success-500/10 border-success-500/20 text-success-500' :
                  syncStatus === 'syncing' ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' :
                  'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    {syncStatus === 'synced' && <CloudCheck size={14} />}
                    {syncStatus === 'syncing' && <CloudLightning size={14} className="animate-pulse" />}
                    {syncStatus === 'error' && <CloudAlert size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {syncStatus === 'synced' ? 'Nube Sincronizada' : 
                       syncStatus === 'syncing' ? 'Guardando en Servidor...' : 
                       'Error de Red'}
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
                <div className="flex items-center gap-3">
                    <Database className="text-brand-500" size={20} />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Diagnóstico de MuscleSync</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800">
                      <div className="text-[9px] text-dark-500 uppercase font-black mb-1">Estado Red</div>
                      <div className="text-xs text-success-500 font-bold flex items-center gap-2">
                        <Wifi size={12} /> ONLINE
                      </div>
                  </div>
                  <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800">
                      <div className="text-[9px] text-dark-500 uppercase font-black mb-1">Caché Local</div>
                      <div className="text-xs text-white font-bold">ACTIVO</div>
                  </div>
                </div>

                <p className="text-[11px] text-dark-500 leading-relaxed italic">
                  * Si usas la app en dos dispositivos al mismo tiempo, espera el check verde antes de cambiar de uno a otro.
                </p>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 border border-dark-800 rounded-xl text-[10px] font-black text-dark-400 hover:text-white hover:bg-dark-800 transition-all uppercase tracking-widest"
                >
                  FORZAR RESINCRONIZACIÓN
                </button>
            </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
