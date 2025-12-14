import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Clock, X, Video, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { User, WorkoutSetLog, WorkoutExerciseLog, WorkoutSession, Badge } from '../types';

interface ActiveWorkoutProps {
  user: User;
  onFinish: (session: WorkoutSession, earnedXP: number, newBadges: Badge[]) => void;
  onCancel: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ user, onFinish, onCancel }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [logs, setLogs] = useState<WorkoutExerciseLog[]>([]);
  const [showRestModal, setShowRestModal] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Initialize logs based on plan
  useEffect(() => {
    if (user.currentPlan?.exercises) {
      const initialLogs = user.currentPlan.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: Array(ex.sets).fill(null).map((_, i) => ({
          setNumber: i + 1,
          weight: 0,
          reps: 0,
          rpe: 0,
          completed: false
        }))
      }));
      setLogs(initialLogs);
    }
  }, [user.currentPlan]);

  // Global Workout Timer
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Timer
  useEffect(() => {
    let interval: number;
    if (showRestModal && restTimer > 0) {
      interval = window.setInterval(() => setRestTimer(t => t - 1), 1000);
    } else if (restTimer === 0 && showRestModal) {
      setShowRestModal(false);
    }
    return () => clearInterval(interval);
  }, [showRestModal, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = user.currentPlan?.exercises[currentExerciseIndex];
  
  if (!currentExercise) return <div className="p-8 text-white">Cargando sesión...</div>;

  const currentExerciseLogs = logs[currentExerciseIndex];

  const handleLogSet = (setIndex: number, field: keyof WorkoutSetLog, value: number) => {
    const newLogs = [...logs];
    newLogs[currentExerciseIndex].sets[setIndex] = {
      ...newLogs[currentExerciseIndex].sets[setIndex],
      [field]: value
    };
    setLogs(newLogs);
  };

  const toggleSetComplete = (setIndex: number) => {
    const set = logs[currentExerciseIndex].sets[setIndex];
    const isCompleting = !set.completed;
    
    handleLogSet(setIndex, 'completed', isCompleting ? 1 : 0); 

    if (isCompleting) {
      setRestTimer(currentExercise.restSeconds);
      setShowRestModal(true);
    }
  };

  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    const volume = logs.reduce((acc, ex) => 
        acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0)
    , 0);

    let xpEarned = 100 + Math.floor(volume / 100);
    const newBadges: Badge[] = [];
    
    if (volume > 10000 && !user.badges.some(b => b.name === 'Volume Beast')) {
        newBadges.push({
          id: `b_vol_${Date.now()}`,
          name: 'Volume Beast',
          description: 'Moviste 10,000kg en una sesión',
          icon: '🦍',
          dateEarned: new Date().toISOString()
      });
    }

    const session: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      planName: user.currentPlan?.name || 'Freestyle',
      durationSeconds: elapsedTime,
      volume: volume,
      logs: logs,
      xpEarned
    };
    
    onFinish(session, xpEarned, newBadges);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 bg-dark-950/90 backdrop-blur-sm sticky top-0 z-20 border-b border-dark-800">
          <button onClick={onCancel} className="text-dark-500 hover:text-white transition-colors p-2 -ml-2">
              <X size={24} />
          </button>
          
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-brand-500 font-bold tracking-widest uppercase">Sesión en Vivo</span>
              <span className="font-mono text-xl font-medium tracking-tight tabular-nums">{formatTime(elapsedTime)}</span>
          </div>

          <button 
             onClick={handleFinishWorkout} 
             className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-brand-400 transition-colors"
          >
             FINALIZAR
          </button>
      </header>

      {/* EXERCISE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32 max-w-2xl mx-auto w-full">
          
          {/* Title Area */}
          <div className="mb-8 flex justify-between items-start">
             <div className="flex-1">
                 <h2 className="text-3xl font-light text-white mb-1 uppercase leading-tight">{currentExercise.name}</h2>
                 <p className="text-dark-500 text-sm flex items-center gap-2">
                    <span className="bg-dark-800 px-2 py-0.5 rounded text-xs border border-dark-700">{currentExercise.sets} Series</span>
                    <span>Meta: {currentExercise.reps} Reps</span>
                 </p>
             </div>
             {currentExercise.gifUrl && (
                 <button onClick={() => setShowVideoModal(true)} className="bg-dark-800 p-3 rounded-xl hover:bg-dark-700 transition-colors border border-dark-700">
                     <Video size={20} className="text-brand-500" />
                 </button>
             )}
          </div>

          {currentExercise.notes && (
             <div className="mb-8 flex gap-3 text-sm text-gray-400 bg-dark-900/50 p-4 rounded-xl border border-dashed border-dark-700">
                 <AlertCircle size={18} className="text-brand-500 flex-shrink-0" />
                 <p>{currentExercise.notes}</p>
             </div>
          )}

          {/* Sets List */}
          <div className="space-y-3">
              <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-dark-500 text-center mb-2 px-2">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">KG</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3">Estado</div>
              </div>

              {currentExerciseLogs?.sets.map((set, idx) => {
                  const isActiveSet = !set.completed && (idx === 0 || currentExerciseLogs.sets[idx - 1].completed);
                  return (
                    <div key={idx} className={`grid grid-cols-10 gap-3 items-center p-3 rounded-xl border transition-all duration-300 ${
                        set.completed ? 'bg-dark-900 border-dark-800 opacity-60' : 
                        isActiveSet ? 'bg-dark-800 border-brand-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 
                        'bg-dark-950 border-dark-800'
                    }`}>
                        <div className="col-span-1 text-center font-bold text-dark-500">{set.setNumber}</div>
                        
                        <div className="col-span-3">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={set.weight || ''}
                                onChange={(e) => handleLogSet(idx, 'weight', parseFloat(e.target.value))}
                                className="w-full bg-transparent border-b border-dark-700 py-2 text-center text-lg font-medium focus:border-brand-500 focus:outline-none text-white placeholder-dark-700 font-mono"
                            />
                        </div>

                        <div className="col-span-3">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={set.reps || ''}
                                onChange={(e) => handleLogSet(idx, 'reps', parseFloat(e.target.value))}
                                className="w-full bg-transparent border-b border-dark-700 py-2 text-center text-lg font-medium focus:border-brand-500 focus:outline-none text-white placeholder-dark-700 font-mono"
                            />
                        </div>

                        <div className="col-span-3">
                            <button 
                                onClick={() => toggleSetComplete(idx)}
                                className={`w-full h-10 rounded-lg flex items-center justify-center transition-all ${
                                    set.completed 
                                    ? 'bg-success-500 text-black font-bold' 
                                    : 'bg-dark-700 hover:bg-dark-600 text-dark-400'
                                }`}
                            >
                                {set.completed ? <Check size={18} strokeWidth={3} /> : <Check size={18} />}
                            </button>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="bg-dark-900 border-t border-dark-800 p-6 flex items-center justify-between pb-safe">
          <button 
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex(i => i - 1)}
            className="p-4 rounded-full bg-dark-800 text-white disabled:opacity-20 hover:bg-dark-700 transition-colors"
          >
              <ChevronRight size={24} className="rotate-180"/>
          </button>
          
          <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-dark-500 font-bold tracking-widest">Ejercicio</span>
              <span className="text-white font-medium">{currentExerciseIndex + 1} / {user.currentPlan?.exercises.length}</span>
          </div>

          <button 
            disabled={currentExerciseIndex === ((user.currentPlan?.exercises.length || 0) - 1)}
            onClick={() => setCurrentExerciseIndex(i => i + 1)}
            className="p-4 rounded-full bg-brand-500 text-black hover:bg-brand-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
              <ChevronRight size={24} />
          </button>
      </div>

      {/* REST TIMER MODAL */}
      {showRestModal && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-fade-in">
            <h3 className="text-dark-500 text-sm font-bold uppercase tracking-[0.2em] mb-8">Descanso</h3>
            
            <div className="relative mb-12">
                <svg className="w-64 h-64 transform -rotate-90">
                    <circle cx="128" cy="128" r="120" stroke="#121212" strokeWidth="8" fill="none" />
                    <circle 
                        cx="128" 
                        cy="128" 
                        r="120" 
                        stroke="#06b6d4" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - restTimer / currentExercise.restSeconds)}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-light font-mono text-white tabular-nums">
                    {formatTime(restTimer)}
                </div>
            </div>
            
            <div className="flex gap-4">
                 <button 
                    onClick={() => setRestTimer(t => t + 30)} 
                    className="px-6 py-3 rounded-xl bg-dark-800 text-white font-medium hover:bg-dark-700 transition-colors border border-dark-700"
                >
                    +30s
                </button>
                <button 
                    onClick={() => setShowRestModal(false)} 
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                >
                    OMITIR
                </button>
            </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-lg bg-dark-900 rounded-2xl overflow-hidden border border-dark-800">
                  <div className="flex justify-between items-center p-4 border-b border-dark-800">
                      <span className="font-bold text-white">Demo: {currentExercise.name}</span>
                      <button onClick={() => setShowVideoModal(false)}><X size={20} className="text-dark-400" /></button>
                  </div>
                  <div className="aspect-video bg-black flex items-center justify-center">
                       {currentExercise.gifUrl ? (
                           <img src={currentExercise.gifUrl} alt="Demo" className="w-full h-full object-contain opacity-90" />
                       ) : <span className="text-dark-500">No hay video disponible</span>}
                  </div>
             </div>
        </div>
      )}
    </div>
  );
};