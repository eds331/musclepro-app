
import React, { useState, useEffect } from 'react';
import { User, DailyLog } from '../types';
import { Play, Check, Flame, Utensils, Zap, Trophy, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getDailyQuote } from '../services/quotes';

interface DashboardProps {
  user: User;
  onStartWorkout: () => void;
  onUpdateUser: (user: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartWorkout, onUpdateUser }) => {
  const [todayLog, setTodayLog] = useState<DailyLog | undefined>(undefined);
  const [quote, setQuote] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let log = user.dailyLogs.find(l => l.date === todayStr);
    if (!log) {
        log = { date: todayStr, mealsEaten: [], cardioDone: false };
    }
    setTodayLog(log);
    setQuote(getDailyQuote());
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

  const totalTasks = 1 + 1 + (user.diet?.meals.length || 0);
  const completedTasks = (todayLog?.workoutCompletedId ? 1 : 0) + (todayLog?.cardioDone ? 1 : 0) + (todayLog?.mealsEaten.length || 0);
  const progress = Math.round((completedTasks / totalTasks) * 100) || 0;

  const ringData = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress }
  ];

  const COLORS = ['#06b6d4', '#1f2937'];

  const dates = [-2, -1, 0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  });

  return (
    <div className="space-y-6">
        <div className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-dark-800/50">
             <div className="flex justify-between items-center max-w-lg mx-auto">
                {dates.map((date, i) => {
                    const isToday = i === 2;
                    return (
                        <div key={i} className={`flex flex-col items-center gap-1 ${isToday ? 'opacity-100 scale-110' : 'opacity-40 scale-95'} transition-all`}>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-500">
                                {date.toLocaleDateString('es-CL', { weekday: 'narrow' })}
                            </span>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border transition-colors ${isToday ? 'bg-white text-black border-white' : 'bg-transparent text-white border-dark-700'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-64 shadow-xl">
                <div>
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Adherencia</span>
                        <div className="bg-dark-800 px-2 py-1 rounded text-[10px] text-white font-mono uppercase">
                            {new Date().toLocaleDateString('es-CL', { month: 'short', day: 'numeric'})}
                        </div>
                     </div>
                     <h2 className="text-3xl font-light text-white">
                         Tu Misión <span className="font-bold">de Hoy</span>
                     </h2>
                </div>
                
                <div className="flex items-center gap-6 mt-4 relative z-10">
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
                     <div className="flex-1 space-y-3">
                         <div className="text-sm text-dark-500 font-medium italic">
                             {progress === 100 ? "¡Objetivos completados!" : "Sigue así, falta poco."}
                         </div>
                         <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500 transition-all duration-1000" style={{width: `${progress}%`}}></div>
                         </div>
                     </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Trophy size={120} className="text-brand-500" />
                </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 flex flex-col justify-between relative h-64 shadow-xl overflow-hidden">
                <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">Estado del Atleta</h3>
                    <Zap className="text-brand-500 animate-pulse" size={20} />
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-5xl font-black text-white italic tracking-tighter">{user.level}</div>
                            <div className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Nivel Actual</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-brand-400 font-mono tracking-tighter">{user.currentXP}</div>
                            <div className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">XP Acumulada</div>
                        </div>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{width: `${(user.currentXP % 1000) / 10}%`}}></div>
                    </div>
                </div>
                <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
        </div>

        {/* --- MOTIVATIONAL QUOTE SECTION --- */}
        <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-5 relative overflow-hidden group">
            <Quote className="absolute right-4 top-4 text-brand-500/10 group-hover:scale-110 transition-transform" size={48} />
            <p className="text-sm md:text-base text-gray-200 font-medium italic relative z-10 leading-relaxed pr-8">
                "{quote}"
            </p>
            <div className="mt-2 text-[9px] font-black text-brand-500 uppercase tracking-widest opacity-60">MINDSET DIARIO</div>
        </div>

        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] px-1">Tareas Planificadas</h3>
            
            <div className={`bg-dark-900 border border-dark-800 p-5 rounded-2xl flex items-center justify-between transition-all ${todayLog?.workoutCompletedId ? 'opacity-50 grayscale' : 'hover:border-dark-700 shadow-lg'}`}>
                 <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${todayLog?.workoutCompletedId ? 'bg-success-500/20 text-success-500' : 'bg-brand-500/10 text-brand-500'}`}>
                         {todayLog?.workoutCompletedId ? <Check size={24} /> : <Play size={24} fill="currentColor" className="ml-1" />}
                     </div>
                     <div>
                         <h4 className="font-bold text-white text-lg">{user.currentPlan?.name}</h4>
                         <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">{user.currentPlan?.split}</p>
                     </div>
                 </div>
                 {!todayLog?.workoutCompletedId && (
                     <button 
                        onClick={onStartWorkout}
                        className="bg-white text-black font-black py-2.5 px-6 rounded-xl text-xs hover:bg-brand-500 transition-all active:scale-95 shadow-lg"
                     >
                         INICIAR
                     </button>
                 )}
            </div>

            <div 
                onClick={handleToggleCardio}
                className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-dark-700 transition-all select-none"
            >
                 <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${todayLog?.cardioDone ? 'bg-brand-500/20 text-brand-500' : 'bg-dark-800 text-dark-500'}`}>
                         <Flame size={20} />
                     </div>
                     <div>
                         <h4 className={`font-bold text-sm ${todayLog?.cardioDone ? 'text-dark-500 line-through' : 'text-white'}`}>Cardio Diario</h4>
                         <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">{user.cardio?.type} • {user.cardio?.duration}</p>
                     </div>
                 </div>
                 <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${todayLog?.cardioDone ? 'bg-brand-500 border-brand-500' : 'border-dark-700'}`}>
                     {todayLog?.cardioDone && <Check size={14} className="text-black" strokeWidth={3} />}
                 </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50">
                    <span className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                        <Utensils size={14} className="text-brand-500"/> Plan Nutricional
                    </span>
                    <span className="text-[10px] text-dark-500 font-mono font-bold tracking-widest">{user.diet?.calories} KCAL</span>
                </div>
                <div className="divide-y divide-dark-800">
                    {user.diet?.meals.map(meal => {
                        const isEaten = todayLog?.mealsEaten.includes(meal.id);
                        return (
                            <div 
                                key={meal.id} 
                                onClick={() => handleToggleMeal(meal.id)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-800/30 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold transition-colors ${isEaten ? 'text-dark-500 line-through' : 'text-gray-200'}`}>
                                        {meal.name}
                                    </span>
                                    <span className="text-[10px] text-dark-500 font-medium">{meal.items[0]}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isEaten ? 'bg-brand-500 border-brand-500' : 'border-dark-700'}`}>
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
