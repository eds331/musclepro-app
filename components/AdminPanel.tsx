import React, { useState } from 'react';
import { User, UserRole, Gender, Goal, ExperienceLevel, SubscriptionStatus } from '../types';
import { Wand2, Users, Save, FileSpreadsheet, Upload, RefreshCw, PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { MOCK_EXERCISES_DB, INITIAL_USER } from '../services/mockData';

interface AdminPanelProps {
  user: User; // The admin
  onUpdateUser: (updatedUser: User) => void; // To update the main app state
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create'>('create');
  
  // Mock generation form
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: Gender.MALE,
    goal: Goal.HYPERTROPHY,
    level: ExperienceLevel.BEGINNER
  });
  
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  // User Management State
  const [mockUsers, setMockUsers] = useState<User[]>([
    user, // Include the current logged in user to demonstrate changes
    {
      ...INITIAL_USER,
      id: 'u2',
      username: 'ClienteDemo',
      email: 'demo@test.com',
      subscriptionStatus: SubscriptionStatus.PAUSED
    },
    {
       ...INITIAL_USER,
       id: 'u3',
       username: 'NuevoIngreso',
       email: 'nuevo@test.com',
       subscriptionStatus: SubscriptionStatus.PAYMENT_PENDING
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleGenerate = () => {
    // Simulate AI Generation logic
    const plan = {
      name: `Plan ${formData.goal} - ${formData.level}`,
      description: 'Generado automáticamente por MUSCLEPRO AI',
      split: formData.level === ExperienceLevel.ADVANCED ? 'Push/Pull/Legs' : 'Full Body',
      exercises: MOCK_EXERCISES_DB.slice(0, 3) // Just a subset for demo
    };
    setGeneratedPlan(plan);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setUploadMessage('');

      // Simulate Excel Parsing delay
      setTimeout(() => {
          setIsUploading(false);
          setUploadMessage(`✅ Éxito: Se importaron 15 usuarios desde ${file.name}`);
          // Mock adding users
          const newMockUsers = [...mockUsers];
          for(let i=0; i<3; i++) {
              newMockUsers.push({
                  ...INITIAL_USER,
                  id: `bulk_${Date.now()}_${i}`,
                  username: `UsuarioImportado_${i+1}`,
                  email: `imported${i+1}@test.com`,
                  subscriptionStatus: SubscriptionStatus.ACTIVE
              });
          }
          setMockUsers(newMockUsers);
      }, 2000);
  };

  const handleSheetSync = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          setUploadMessage('✅ Sincronizado con Google Sheets: 3 suscripciones renovadas, 1 usuario nuevo.');
      }, 2500);
  };

  const toggleSubscription = (targetUserId: string) => {
      const updatedList = mockUsers.map(u => {
          if (u.id === targetUserId) {
              const newStatus = u.subscriptionStatus === SubscriptionStatus.ACTIVE 
                ? SubscriptionStatus.PAUSED 
                : SubscriptionStatus.ACTIVE;
              
              const updatedUser = { ...u, subscriptionStatus: newStatus };
              
              // If we modified the currently logged in user, update App state
              if (u.id === user.id) {
                  onUpdateUser(updatedUser);
              }
              return updatedUser;
          }
          return u;
      });
      setMockUsers(updatedList);
  };

  return (
    <div className="p-5 space-y-6 h-full flex flex-col">
       <header>
          <h1 className="text-2xl font-black text-white">PANEL ADMIN</h1>
          <p className="text-brand-500 text-sm font-bold">STAFF ACCESS ONLY</p>
        </header>

        <div className="flex space-x-2 bg-dark-800 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-dark-700 text-white shadow shadow-black/50' : 'text-gray-500 hover:text-white'}`}
            >
                <Wand2 size={16} className="inline mr-2" />
                Generador
            </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-dark-700 text-white shadow shadow-black/50' : 'text-gray-500 hover:text-white'}`}
            >
                <Users size={16} className="inline mr-2" />
                Usuarios
            </button>
        </div>

        {activeTab === 'create' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-4">
                    <h3 className="font-bold text-gray-300">Datos del Cliente</h3>
                    
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase">Nombre</label>
                        <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white focus:border-brand-500 focus:outline-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase">Meta</label>
                            <select 
                                value={formData.goal}
                                onChange={(e) => setFormData({...formData, goal: e.target.value as Goal})}
                                className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                            >
                                {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase">Nivel</label>
                            <select 
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value as ExperienceLevel})}
                                className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                            >
                                {Object.values(ExperienceLevel).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-500 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
                    >
                        <Wand2 size={18} />
                        GENERAR PLAN AUTOMÁTICO
                    </button>
                </div>

                {generatedPlan && (
                    <div className="bg-dark-800 p-4 rounded-xl border-l-4 border-green-500 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white">{generatedPlan.name}</h3>
                                <p className="text-xs text-gray-400">{generatedPlan.split}</p>
                            </div>
                            <button className="text-green-500 bg-green-500/10 p-2 rounded hover:bg-green-500/20">
                                <Save size={18} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {generatedPlan.exercises.map((ex: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm py-1 border-b border-dark-700 last:border-0">
                                    <span>{ex.name}</span>
                                    <span className="font-mono text-gray-500">{ex.sets} x {ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'users' && (
             <div className="flex-1 overflow-y-auto space-y-6">
                 {/* Bulk Actions */}
                 <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-3">
                     <h3 className="font-bold text-gray-300 flex items-center gap-2">
                         <FileSpreadsheet size={18} className="text-green-500"/> Importación Masiva
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <div className="relative group">
                            <input 
                                type="file" 
                                accept=".xlsx, .xls, .csv" 
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={isUploading}
                            />
                            <div className={`border-2 border-dashed border-dark-600 rounded-lg p-3 text-center flex flex-col items-center justify-center h-full transition-colors ${isUploading ? 'bg-dark-700' : 'group-hover:border-brand-500 group-hover:bg-dark-700/50'}`}>
                                <Upload size={20} className={`mb-1 ${isUploading ? 'animate-bounce text-brand-500' : 'text-gray-400'}`} />
                                <span className="text-[10px] font-bold text-gray-400">
                                    {isUploading ? 'Procesando...' : 'Subir Excel'}
                                </span>
                            </div>
                         </div>

                         <button 
                            onClick={handleSheetSync}
                            disabled={isSyncing}
                            className="bg-green-900/10 border border-green-800 rounded-lg p-3 text-center flex flex-col items-center justify-center hover:bg-green-900/30 transition-colors"
                         >
                            <RefreshCw size={20} className={`mb-1 text-green-500 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span className="text-[10px] font-bold text-green-400">
                                {isSyncing ? 'Sincronizando...' : 'Sync Google Sheets'}
                            </span>
                         </button>
                     </div>
                     {uploadMessage && (
                         <div className="text-[10px] text-green-400 font-mono bg-green-900/20 p-2 rounded">
                             {uploadMessage}
                         </div>
                     )}
                 </div>

                 {/* User List & Subscription Management */}
                 <div className="space-y-3">
                     <h3 className="font-bold text-gray-300">Gestión de Suscripciones</h3>
                     {mockUsers.map(u => (
                         <div key={u.id} className="bg-dark-800 p-3 rounded-xl border border-dark-700 flex justify-between items-center hover:bg-dark-700/50 transition-colors">
                             <div>
                                 <div className="font-bold text-sm flex items-center gap-2 text-white">
                                     {u.username}
                                     {u.id === user.id && <span className="text-[8px] bg-brand-600 px-1 rounded text-white">TÚ</span>}
                                 </div>
                                 <div className="text-xs text-gray-500">{u.email}</div>
                                 <div className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${
                                     u.subscriptionStatus === SubscriptionStatus.ACTIVE ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                 }`}>
                                     {u.subscriptionStatus}
                                 </div>
                             </div>
                             <button 
                                onClick={() => toggleSubscription(u.id)}
                                className={`p-2 rounded-full transition-colors ${
                                    u.subscriptionStatus === SubscriptionStatus.ACTIVE 
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                    : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                                }`}
                                title={u.subscriptionStatus === SubscriptionStatus.ACTIVE ? 'Pausar Suscripción' : 'Activar Suscripción'}
                             >
                                 {u.subscriptionStatus === SubscriptionStatus.ACTIVE ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                             </button>
                         </div>
                     ))}
                 </div>
            </div>
        )}
    </div>
  );
};