import React, { useState, useEffect } from 'react';
import { User, DailyLog, SubscriptionStatus } from '../types';
import { Play, Check, ChevronRight, Zap, Flame, Utensils, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  onStartWorkout: () => void;
  onUpdateUser: (user: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartWorkout, onUpdateUser }) => {
  const [todayLog, setTodayLog] = useState<DailyLog | undefined>(undefined);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let log = user.dailyLogs.find(l => l.date === todayStr);
    if (!log) {
        log = { date: todayStr, mealsEaten: [], cardioDone: false };
    }
    setTodayLog(log);
  }, [user, todayStr]);

  const handleToggleMeal = (mealId: string) => {
    if (!todayLog) return;
    const isEaten = todayLog.mealsEaten.includes(mealId);
    let newMeals = isEaten 
        ? todayLog.mealsEaten.filter(id => id !== mealId)
        : [...todayLog.mealsEaten, mealId];
    
    updateLog({ ...todayLog, mealsEaten: newMeals });
  };

  const handleToggleCardio = () => {
    if (!todayLog) return;
    updateLog({ ...todayLog, cardioDone: !todayLog.cardioDone });
  };

  const updateLog = (newLog: DailyLog) => {
      setTodayLog(newLog);
      const otherLogs = user.dailyLogs.filter(l => l.date !== todayStr);
      onUpdateUser({ ...user, dailyLogs: [...otherLogs, newLog] });
  };

  // Calculate Daily Score
  const totalTasks = 1 + 1 + (user.diet?.meals.length || 0); // Workout + Cardio + Meals
  const completedTasks = (todayLog?.workoutCompletedId ? 1 : 0) + (todayLog?.cardioDone ? 1 : 0) + (todayLog?.mealsEaten.length || 0);
  const progress = Math.round((completedTasks / totalTasks) * 100) || 0;

  const ringData = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress }
  ];

  const COLORS = ['#06b6d4', '#1f2937']; // Brand Cyan vs Dark Gray

  // Dates for header
  const dates = [-2, -1, 0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  });

  return (
    <div className="space-y-6">
        {/* --- CALENDAR STRIP (STICKY PANEL) --- */}
        <div className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-dark-800/50 shadow-lg shadow-black/20">
             <div className="flex justify-between items-center max-w-lg mx-auto">
                {dates.map((date, i) => {
                    const isToday = i === 2;
                    const isPast = i < 2;
                    return (
                        <div key={i} className={`flex flex-col items-center gap-1 ${isToday ? 'opacity-100 scale-110' : 'opacity-40 scale-95'} transition-all`}>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-500">
                                {date.toLocaleDateString('es-CL', { weekday: 'narrow' })}
                            </span>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border transition-colors ${isToday ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-transparent text-white border-dark-700'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- PROGRESS HERO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-64">
                <div>
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-dark-500 uppercase tracking-wider">Adherencia Diaria</span>
                        <div className="bg-dark-800 px-2 py-1 rounded text-xs text-white border border-dark-700 font-mono capitalize">
                            {new Date().toLocaleDateString('es-CL', { month: 'long', day: 'numeric'})}
                        </div>
                     </div>
                     <h2 className="text-3xl font-light text-white">
                         Tu Misión <span className="font-bold text-white">de Hoy</span>
                     </h2>
                </div>
                
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-48 h-48 opacity-20 pointer-events-none blur-3xl bg-brand-500/50 rounded-full"></div>

                <div className="flex items-center gap-6 mt-4">
                     <div className="w-24 h-24 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ringData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={36}
                                    outerRadius={45}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {ringData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{progress}%</span>
                        </div>
                     </div>
                     <div className="flex-1 space-y-2">
                         <div className="text-sm text-gray-400">
                             {progress === 100 ? "Objetivos cumplidos." : "Enfócate en el proceso."}
                         </div>
                         <div className="h-1 w-full bg-dark-800 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500 transition-all duration-700" style={{width: `${progress}%`}}></div>
                         </div>
                     </div>
                </div>
            </div>

            {/* --- AI MESSAGE --- */}
            <div className="bg-gradient-to-br from-brand-900/40 to-dark-900 border border-brand-900/30 rounded-3xl p-6 flex flex-col justify-center relative">
                 <div className="absolute top-4 right-4 text-brand-500 animate-pulse">
                     <Zap size={18} fill="currentColor" />
                 </div>
                 <h3 className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">Consejo Coach IA</h3>
                 <p className="text-lg font-medium text-white leading-relaxed">
                     "La consistencia supera a la intensidad hoy, {user.username}. Cuida tu ingesta proteica post-entreno."
                 </p>
                 <button className="mt-4 text-xs font-bold text-white flex items-center gap-2 hover:gap-3 transition-all">
                     PREGUNTAR <ArrowRight size={14} />
                 </button>
            </div>
        </div>

        {/* --- TASKS LIST --- */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-500 uppercase tracking-widest px-1">Tareas Planificadas</h3>
            
            {/* 1. WORKOUT CARD */}
            <div className={`group relative p-1 rounded-2xl transition-all ${todayLog?.workoutCompletedId ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}>
                 <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                 <div className="bg-dark-900 border border-dark-800 p-5 rounded-xl flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${todayLog?.workoutCompletedId ? 'bg-success-500/20 text-success-500' : 'bg-dark-800 text-white'}`}>
                             {todayLog?.workoutCompletedId ? <Check size={24} /> : <Play size={24} fill="white" className="ml-1" />}
                         </div>
                         <div>
                             <h4 className="font-bold text-white text-lg">{user.currentPlan?.name}</h4>
                             <p className="text-sm text-dark-500">{user.currentPlan?.duration || '60'} min • {user.currentPlan?.split}</p>
                         </div>
                     </div>
                     {!todayLog?.workoutCompletedId && (
                         <button 
                            onClick={onStartWorkout}
                            className="bg-white text-black font-bold py-2 px-6 rounded-full text-sm hover:bg-brand-400 transition-colors"
                         >
                             INICIAR
                         </button>
                     )}
                 </div>
            </div>

            {/* 2. CARDIO CARD */}
            <div 
                onClick={handleToggleCardio}
                className="bg-dark-900 border border-dark-800 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-dark-700 transition-all select-none"
            >
                 <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${todayLog?.cardioDone ? 'bg-brand-500/20 text-brand-500' : 'bg-dark-800 text-dark-500'}`}>
                         <Flame size={20} />
                     </div>
                     <div>
                         <h4 className={`font-medium ${todayLog?.cardioDone ? 'text-dark-500 line-through' : 'text-white'}`}>Cardio Diario</h4>
                         <p className="text-xs text-dark-500">{user.cardio?.type} • {user.cardio?.duration}</p>
                     </div>
                 </div>
                 <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${todayLog?.cardioDone ? 'bg-brand-500 border-brand-500' : 'border-dark-600'}`}>
                     {todayLog?.cardioDone && <Check size={14} className="text-black" strokeWidth={3} />}
                 </div>
            </div>

            {/* 3. MEALS */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                        <Utensils size={16} className="text-brand-500"/> Plan Nutricional
                    </span>
                    <span className="text-xs text-dark-500 font-mono">{user.diet?.calories} kcal</span>
                </div>
                <div className="divide-y divide-dark-800">
                    {user.diet?.meals.map(meal => {
                        const isEaten = todayLog?.mealsEaten.includes(meal.id);
                        return (
                            <div 
                                key={meal.id} 
                                onClick={() => handleToggleMeal(meal.id)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-800/50 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium transition-colors ${isEaten ? 'text-dark-500 line-through' : 'text-gray-300'}`}>
                                        {meal.name}
                                    </span>
                                    <span className="text-xs text-dark-500">{meal.items[0]}</span>
                                </div>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isEaten ? 'bg-brand-500 border-brand-500' : 'border-dark-600'}`}>
                                    {isEaten && <Check size={12} className="text-black" strokeWidth={3} />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};