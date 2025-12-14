import React from 'react';
import { User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, Calendar, Dumbbell } from 'lucide-react';

interface ProgressProps {
  user: User;
}

export const Progress: React.FC<ProgressProps> = ({ user }) => {
  // Format history for charts
  const volumeData = [...user.history].reverse().map(h => ({
      date: new Date(h.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
      volume: h.volume / 1000 // in tons
  }));

  const weightData = [
      { date: 'Ene', weight: 80 },
      { date: 'Feb', weight: 81.5 },
      { date: 'Mar', weight: 82 }, // Mock data as user stats don't have history array yet
  ];

  return (
    <div className="space-y-8 animate-slide-up">
        
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-900 border border-dark-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-dark-500 text-xs font-bold uppercase tracking-wider">
                    <Trophy size={14} className="text-gold-500" /> Nivel Actual
                </div>
                <div className="text-3xl font-light text-white">Lvl <span className="font-bold">{user.level}</span></div>
                <div className="w-full bg-dark-800 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-gold-500 h-full" style={{width: `${(user.currentXP % 1000) / 10}%`}}></div>
                </div>
            </div>
            <div className="bg-dark-900 border border-dark-800 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-dark-500 text-xs font-bold uppercase tracking-wider">
                    <Dumbbell size={14} className="text-brand-500" /> Volumen Total
                </div>
                <div className="text-3xl font-light text-white">
                    {(user.history.reduce((a, b) => a + b.volume, 0) / 1000).toFixed(0)}<span className="text-sm font-normal text-dark-500 ml-1">tons</span>
                </div>
                <div className="text-xs text-green-500 mt-2 font-mono">+12% vs mes anterior</div>
            </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
            
            {/* Volume Chart */}
            <div className="bg-dark-900 border border-dark-800 p-6 rounded-3xl">
                <h3 className="text-white font-medium mb-6">Carga de Volumen (Toneladas)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px'}}
                                itemStyle={{color: '#fff'}}
                            />
                            <Area type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Consistency (Bar) */}
             <div className="bg-dark-900 border border-dark-800 p-6 rounded-3xl">
                <h3 className="text-white font-medium mb-6">Sesiones por Semana</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volumeData.slice(0, 5)}> 
                            <Bar dataKey="volume" fill="#27272a" radius={[4, 4, 0, 0]} barSize={20} />
                            <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    </div>
  );
};