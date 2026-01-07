
import React, { useState } from 'react';
import { User, Gender, Goal, ExperienceLevel, SubscriptionStatus } from '../types';
import { Wand2, Users, Save, FileSpreadsheet, RefreshCw, Check, Loader2 } from 'lucide-react';
import { INITIAL_USER } from '../services/mockData';
import { generatePlan } from '../services/routineGenerator';

interface AdminPanelProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create'>('create');
  
  const [formData, setFormData] = useState({
    name: '',
    gender: Gender.MALE,
    goal: Goal.HYPERTROPHY,
    level: ExperienceLevel.BEGINNER
  });
  
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleGenerate = () => {
    const plan = generatePlan(formData.gender, formData.level, formData.goal);
    setGeneratedResult(plan);
  };

  const handleSheetSync = () => {
      setIsSyncing(true);
      setSyncSuccess(false);
      
      // Simulación de conexión con Google Sheets API
      setTimeout(() => {
          setIsSyncing(false);
          setSyncSuccess(true);
          setTimeout(() => setSyncSuccess(false), 4000);
      }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Admin Hub</h1>
            <p className="text-brand-500 text-[10px] font-black tracking-[0.3em] uppercase">Control Maestro de Atletas</p>
          </div>
          <button 
            onClick={handleSheetSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                syncSuccess ? 'bg-success-500 text-black' : 'bg-white text-black hover:bg-brand-500'
            }`}
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : syncSuccess ? <Check size={16} /> : <FileSpreadsheet size={16} />}
            {isSyncing ? 'SINCRONIZANDO...' : syncSuccess ? 'SINCRO EXITOSA' : 'SYNC GOOGLE SHEETS'}
          </button>
        </header>

        <div className="flex bg-dark-900 p-1.5 rounded-2xl border border-dark-800">
            <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-dark-800 text-white shadow-lg' : 'text-dark-500 hover:text-white'}`}
            >
                Generador de Protocolos
            </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-dark-800 text-white shadow-lg' : 'text-dark-500 hover:text-white'}`}
            >
                Base de Datos Atletas
            </button>
        </div>

        {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-dark-900 border border-dark-800 p-8 rounded-[2rem] space-y-6 shadow-2xl">
                    <h3 className="font-black text-white italic tracking-tighter uppercase text-xl">Configurar Perfil</h3>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">Nombre del Atleta</label>
                        <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white focus:border-brand-500 transition-all outline-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">Género</label>
                            <select 
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                                className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white text-sm focus:border-brand-500 outline-none"
                            >
                                <option value={Gender.MALE}>Masculino</option>
                                <option value={Gender.FEMALE}>Femenino</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">Nivel Experiencia</label>
                            <select 
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value as ExperienceLevel})}
                                className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white text-sm focus:border-brand-500 outline-none"
                            >
                                <option value={ExperienceLevel.BEGINNER}>Principiante (4d)</option>
                                <option value={ExperienceLevel.INTERMEDIATE}>Intermedio (5d)</option>
                                <option value={ExperienceLevel.ADVANCED}>Avanzado (6d)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        className="w-full bg-brand-600 text-black font-black py-5 rounded-2xl hover:bg-brand-500 flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-500/10 uppercase tracking-widest text-sm active:scale-95"
                    >
                        <Wand2 size={20} />
                        FORJAR PROTOCOLO
                    </button>
                </div>

                {generatedResult && (
                    <div className="bg-dark-900 border border-dark-800 p-8 rounded-[2rem] relative animate-slide-up shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-500 text-black font-black px-6 py-2 rounded-bl-2xl text-[10px] tracking-[0.2em] uppercase italic">
                            Protocolo Generado
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">{generatedResult.name}</h3>
                            <p className="text-dark-500 text-[10px] font-bold uppercase tracking-widest">{generatedResult.split}</p>
                        </div>
                        <div className="space-y-3 mb-8">
                            {generatedResult.exercises.map((ex: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm py-4 border-b border-dark-800/50 last:border-0">
                                    <span className="text-gray-200 font-bold uppercase tracking-tighter">{ex.name}</span>
                                    <span className="font-black text-brand-500 font-mono tracking-tighter">{ex.sets} x {ex.reps}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-500 transition-all uppercase tracking-widest text-[10px]">
                            <Save size={16} /> ASIGNAR A ATLETA
                        </button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'users' && (
             <div className="bg-dark-900 border border-dark-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-dark-950/50 border-b border-dark-800">
                          <tr>
                              <th className="p-6 text-[10px] font-black uppercase text-dark-500 tracking-widest">Atleta</th>
                              <th className="p-6 text-[10px] font-black uppercase text-dark-500 tracking-widest">Plan</th>
                              <th className="p-6 text-[10px] font-black uppercase text-dark-500 tracking-widest">Estado</th>
                              <th className="p-6 text-[10px] font-black uppercase text-dark-500 tracking-widest">Acción</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-800/50">
                          <tr className="hover:bg-dark-800/20 transition-colors">
                              <td className="p-6">
                                  <div className="font-bold text-white uppercase tracking-tighter">Ed Sanhueza</div>
                                  <div className="text-[10px] text-dark-500">ed.sanhuezag@gmail.com</div>
                              </td>
                              <td className="p-6">
                                  <span className="text-[10px] bg-dark-800 px-3 py-1 rounded-full text-white font-bold tracking-widest">HIPERTROFIA V2</span>
                              </td>
                              <td className="p-6">
                                  <span className="text-[10px] text-success-500 font-black tracking-widest border border-success-500/20 px-2 py-1 rounded uppercase italic">ACTIVO</span>
                              </td>
                              <td className="p-6">
                                  <button className="text-dark-500 hover:text-white transition-colors"><RefreshCw size={18} /></button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
             </div>
        )}
    </div>
  );
};
