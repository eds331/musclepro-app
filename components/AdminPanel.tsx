
import React, { useState, useEffect } from 'react';
import { User, Gender, Goal, ExperienceLevel } from '../types';
import { Wand2, Database, Save, FileSpreadsheet, RefreshCw, Check, Loader2, Server, Key, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PersistenceService, DBConfig } from '../services/persistenceService';
import { generatePlan } from '../services/routineGenerator';

interface AdminPanelProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create' | 'infra'>('infra');
  const [dbConfig, setDbConfig] = useState<DBConfig>(PersistenceService.getConfig());
  
  const [formData, setFormData] = useState({
    name: '',
    gender: Gender.MALE,
    goal: Goal.HYPERTROPHY,
    level: ExperienceLevel.BEGINNER
  });
  
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDB = (type: 'SUPABASE' | 'IHOSTING' | 'SANDBOX') => {
    setIsSyncing(true);
    const newConfig = { ...dbConfig, type };
    PersistenceService.setConfig(newConfig);
    setDbConfig(newConfig);
    
    setTimeout(() => {
      setIsSyncing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleGenerate = () => {
    const plan = generatePlan(formData.gender, formData.level, formData.goal);
    setGeneratedResult(plan);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Admin Hub</h1>
            <p className="text-brand-500 text-[10px] font-black tracking-[0.3em] uppercase">Control Maestro de Atletas</p>
          </div>
        </header>

        <div className="flex bg-dark-900 p-1.5 rounded-2xl border border-dark-800 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('infra')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'infra' ? 'bg-dark-800 text-brand-500 shadow-lg' : 'text-dark-500 hover:text-brand-500'}`}
            >
                Infraestructura
            </button>
            <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-dark-800 text-white shadow-lg' : 'text-dark-500 hover:text-white'}`}
            >
                Protocolos
            </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-dark-800 text-white shadow-lg' : 'text-dark-500 hover:text-white'}`}
            >
                Atletas
            </button>
        </div>

        {activeTab === 'infra' && (
            <div className="space-y-6">
                {/* IHOSTING OPTION */}
                <div className="bg-dark-900 border border-dark-800 p-8 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20">
                            <Globe size={24} className="text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">IHosting / musclepro.cl</h3>
                            <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest">Servidor MySQL Propio</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">URL de API Bridge (sync.php)</label>
                            <input 
                                value={dbConfig.type === 'IHOSTING' ? dbConfig.url : ''}
                                onChange={(e) => setDbConfig({...dbConfig, url: e.target.value, type: 'IHOSTING'})}
                                placeholder="https://musclepro.cl/api/sync.php"
                                className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white text-sm focus:border-brand-500 outline-none font-mono"
                            />
                        </div>

                        <div className="p-4 bg-dark-950 border border-dark-800 rounded-xl">
                            <h4 className="text-[9px] font-black text-dark-500 uppercase tracking-[0.2em] mb-3">Requerimiento Técnico</h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                Asegúrate de haber subido el script <code className="text-brand-500">sync.php</code> a tu servidor y configurado las credenciales de MySQL correctamente.
                            </p>
                        </div>

                        <button 
                            onClick={() => handleSaveDB('IHOSTING')}
                            disabled={isSyncing}
                            className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 ${dbConfig.type === 'IHOSTING' ? 'bg-brand-500 text-black' : 'bg-dark-800 text-white hover:bg-dark-700'}`}
                        >
                            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : (dbConfig.type === 'IHOSTING' && saveSuccess) ? <Check size={20} /> : <Save size={20} />}
                            {isSyncing ? 'CONFIGURANDO...' : 'USAR MI HOSTING'}
                        </button>
                    </div>
                </div>

                {/* SUPABASE OPTION */}
                <div className="bg-dark-900 border border-dark-800 p-8 rounded-[2rem] space-y-6 shadow-2xl opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-success-500/10 rounded-2xl border border-success-500/20">
                            <Server size={24} className="text-success-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Supabase Cloud</h3>
                            <p className="text-[10px] text-success-500 font-black uppercase tracking-widest">Enterprise Database</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">Supabase URL</label>
                                <input 
                                    value={dbConfig.type === 'SUPABASE' ? dbConfig.url : ''}
                                    onChange={(e) => setDbConfig({...dbConfig, url: e.target.value, type: 'SUPABASE'})}
                                    placeholder="https://xyz.supabase.co"
                                    className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white text-xs focus:border-brand-500 outline-none font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-dark-500 uppercase font-black tracking-widest">Anon Key</label>
                                <input 
                                    type="password"
                                    value={dbConfig.type === 'SUPABASE' ? dbConfig.key : ''}
                                    onChange={(e) => setDbConfig({...dbConfig, key: e.target.value, type: 'SUPABASE'})}
                                    placeholder="eyJhb..."
                                    className="w-full bg-dark-950 border border-dark-800 rounded-xl p-4 text-white text-xs focus:border-brand-500 outline-none font-mono"
                                />
                            </div>
                         </div>
                         <button 
                            onClick={() => handleSaveDB('SUPABASE')}
                            disabled={isSyncing}
                            className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 ${dbConfig.type === 'SUPABASE' ? 'bg-success-500 text-black' : 'bg-dark-800 text-white hover:bg-dark-700'}`}
                        >
                            USAR SUPABASE
                        </button>
                    </div>
                </div>

                <div className="bg-dark-900 border border-dark-800 p-6 rounded-3xl flex items-center gap-4">
                    <ShieldCheck className="text-brand-500" size={20} />
                    <p className="text-[10px] text-dark-500 font-medium italic">
                        Cualquier configuración que elijas se guarda de forma persistente en este navegador y se utiliza para sincronizar tus otros dispositivos.
                    </p>
                </div>
            </div>
        )}

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
