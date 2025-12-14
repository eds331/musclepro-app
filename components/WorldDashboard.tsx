
import React, { useState, useRef, useEffect } from 'react';
import { User, LifeAreaName, LifeHabit, WorldProfile, SocialPartner, SocialMessage, Goal, ExperienceLevel } from '../types';
import { Brain, Heart, Briefcase, DollarSign, Users, Target, BookOpen, Home, Moon, Zap, ShoppingBag, MessageSquare, Send, ChevronLeft, Lock, Coffee, Utensils, Smile, AlertCircle, Sparkles, UserPlus } from 'lucide-react';
import { createWorldChat, sendMessageToAI } from '../services/geminiService';
import { Chat } from '@google/genai';

interface WorldDashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onExit: () => void;
}

const AREA_ICONS: Record<LifeAreaName, React.ReactNode> = {
  'Salud & Energía': <Heart size={20} />,
  'Cuerpo & Movimiento': <Zap size={20} />,
  'Trabajo / Empresa': <Briefcase size={20} />,
  'Finanzas': <DollarSign size={20} />,
  'Relaciones': <Users size={20} />,
  'Disciplina & Enfoque': <Target size={20} />,
  'Desarrollo Personal': <BookOpen size={20} />,
  'Familia': <Home size={20} />,
  'Descanso & Balance': <Moon size={20} />,
};

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  energyRestore: number;
  icon: React.ReactNode;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'rest', name: 'Descanso Estratégico', description: 'Día libre de presiones sin culpa.', cost: 50, energyRestore: 20, icon: <Moon size={24} className="text-indigo-400"/> },
  { id: 'cheat', name: 'Comida Consciente', description: 'Disfrute gastronómico planificado.', cost: 40, energyRestore: 5, icon: <Utensils size={24} className="text-orange-400"/> },
  { id: 'social', name: 'Evento Social', description: 'Conexión humana y desconexión laboral.', cost: 60, energyRestore: 15, icon: <Smile size={24} className="text-yellow-400"/> },
  { id: 'deep_rest', name: 'Desconexión Total', description: 'Reset completo de sistema (Fin de semana).', cost: 100, energyRestore: 60, icon: <Zap size={24} className="text-brand-400"/> },
];

// MOCK SOCIAL USERS FOR MATCHING
const MOCK_SOCIAL_POOL: Omit<SocialPartner, 'matchPercentage'>[] = [
  { id: 'p1', username: 'IronValkyrie', level: 8, goal: Goal.HYPERTROPHY, experience: ExperienceLevel.ADVANCED, avatarColor: 'bg-purple-600', isOnline: true },
  { id: 'p2', username: 'CardioKing', level: 3, goal: Goal.WEIGHT_LOSS, experience: ExperienceLevel.BEGINNER, avatarColor: 'bg-orange-500', isOnline: false },
  { id: 'p3', username: 'PowerLifter99', level: 12, goal: Goal.STRENGTH, experience: ExperienceLevel.ADVANCED, avatarColor: 'bg-red-600', isOnline: true },
  { id: 'p4', username: 'ZenMaster', level: 5, goal: Goal.ATHLETIC_PERFORMANCE, experience: ExperienceLevel.INTERMEDIATE, avatarColor: 'bg-teal-500', isOnline: true },
  { id: 'p5', username: 'NewbieGains', level: 1, goal: Goal.HYPERTROPHY, experience: ExperienceLevel.BEGINNER, avatarColor: 'bg-blue-500', isOnline: false },
];

export const WorldDashboard: React.FC<WorldDashboardProps> = ({ user, onUpdateUser, onExit }) => {
  const [activeView, setActiveView] = useState<'overview' | 'area' | 'narrator' | 'shop' | 'social'>('overview');
  const [selectedArea, setSelectedArea] = useState<LifeAreaName | null>(null);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', text: string}[]>([
      {role: 'model', text: 'Bienvenido al Mundo MUSCLEPRO. Tus estadísticas vitales están cargadas. ¿Qué área requiere atención estratégica hoy?'}
  ]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  // Social State
  const [matches, setMatches] = useState<SocialPartner[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [socialInput, setSocialInput] = useState('');
  const [peerMessages, setPeerMessages] = useState<Record<string, SocialMessage[]>>({
      'p1': [{ id: 'm1', senderId: 'p1', text: '¡Hola! Vi que también buscas hipertrofia. ¿Qué rutina sigues?', timestamp: '10:00' }],
      'p3': [{ id: 'm2', senderId: 'p3', text: 'Buen progreso en banca. Sigue así.', timestamp: 'Yesterday' }]
  });

  const profile = user.worldProfile!;

  // Initialize AI Chat
  useEffect(() => {
     if (!chatRef.current) chatRef.current = createWorldChat(user);
  }, [user]);

  // Initialize Matches Calculation
  useEffect(() => {
     const calculatedMatches = MOCK_SOCIAL_POOL.map(partner => {
         let score = 50; // Base score
         
         // Goal Match (+30)
         if (partner.goal === user.stats?.goal) score += 30;
         
         // Level Proximity (+20)
         const levelDiff = Math.abs(partner.level - (user.worldProfile?.globalLevel || 1));
         if (levelDiff <= 2) score += 20;
         else if (levelDiff <= 5) score += 10;

         // Experience Match (+10)
         if (partner.experience === user.stats?.level) score += 10;

         return { ...partner, matchPercentage: Math.min(score, 100) };
     }).sort((a, b) => b.matchPercentage - a.matchPercentage);

     setMatches(calculatedMatches);
  }, [user]);

  // --- ACTIONS ---

  const handleHabit = (areaName: LifeAreaName, type: 'positive' | 'negative') => {
      const area = profile.areas[areaName];
      let newXp = area.currentXp;
      let newEnergy = profile.energy;
      let newCredits = profile.credits;

      if (type === 'positive') {
          newXp += 10;
          newEnergy += 5; // Recovery
          newCredits += 5;
      } else {
          newEnergy -= 10; // Drain
      }

      // Cap Energy
      if (newEnergy > 1000) newEnergy = 1000;
      if (newEnergy < 0) newEnergy = 0;

      // Level Up Logic: XP Req = Level * 100
      const xpReq = area.level * 100;
      let newLevel = area.level;
      if (newXp >= xpReq) {
          newXp -= xpReq;
          newLevel += 1;
      }

      // Update State
      const updatedProfile = {
          ...profile,
          energy: newEnergy,
          credits: newCredits,
          areas: {
              ...profile.areas,
              [areaName]: { ...area, currentXp: newXp, level: newLevel }
          }
      };
      
      onUpdateUser({ ...user, worldProfile: updatedProfile });
  };

  const handlePurchase = (item: ShopItem) => {
      if (profile.credits < item.cost) {
          setPurchaseFeedback("Créditos insuficientes.");
          setTimeout(() => setPurchaseFeedback(null), 2000);
          return;
      }

      const newCredits = profile.credits - item.cost;
      let newEnergy = profile.energy + item.energyRestore;
      if (newEnergy > 1000) newEnergy = 1000;

      const newItemLog = `${item.name} | -${item.cost} CR | ${new Date().toLocaleDateString('es-CL', {month: 'short', day: 'numeric'})}`;
      const newInventory = [newItemLog, ...profile.inventory].slice(0, 20); // Keep last 20 items

      const updatedProfile = {
          ...profile,
          credits: newCredits,
          energy: newEnergy,
          inventory: newInventory
      };

      onUpdateUser({ ...user, worldProfile: updatedProfile });
      setPurchaseFeedback(`Comprado: ${item.name}`);
      setTimeout(() => setPurchaseFeedback(null), 2000);
  };

  const handleSendMessage = async () => {
      if (!input.trim() || !chatRef.current) return;
      const msg = input;
      setInput('');
      setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
      setIsAiLoading(true);
      const res = await sendMessageToAI(chatRef.current, msg);
      setChatMessages(prev => [...prev, { role: 'model', text: res }]);
      setIsAiLoading(false);
  };

  const handleSendPeerMessage = () => {
      if (!socialInput.trim() || !activePartnerId) return;
      
      const newMsg: SocialMessage = {
          id: Date.now().toString(),
          senderId: 'me',
          text: socialInput,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      setPeerMessages(prev => ({
          ...prev,
          [activePartnerId]: [...(prev[activePartnerId] || []), newMsg]
      }));
      setSocialInput('');

      // Simulate Reply
      setTimeout(() => {
          const replyMsg: SocialMessage = {
            id: (Date.now() + 1).toString(),
            senderId: activePartnerId,
            text: "¡Totalmente! Seguimos en contacto.",
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          setPeerMessages(prev => ({
            ...prev,
            [activePartnerId]: [...(prev[activePartnerId] || []), replyMsg]
        }));
      }, 3000);
  };

  // --- RENDERERS ---

  const renderOverview = () => (
      <div className="space-y-6 animate-fade-in pb-24">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-dark-500 text-xs font-bold uppercase tracking-wider mb-2">
                      <Zap size={14} className="text-brand-500" /> Energía Vital
                  </div>
                  <div className="text-3xl font-light text-white font-mono">{profile.energy}<span className="text-dark-500 text-lg">/1000</span></div>
                  <div className="w-full bg-dark-800 h-1 mt-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${profile.energy < 300 ? 'bg-danger-500' : 'bg-brand-500'}`} style={{width: `${profile.energy/10}%`}}></div>
                  </div>
              </div>
              <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl">
                   <div className="flex items-center gap-2 text-dark-500 text-xs font-bold uppercase tracking-wider mb-2">
                      <DollarSign size={14} className="text-gold-500" /> Créditos
                  </div>
                  <div className="text-3xl font-light text-white font-mono">{profile.credits}</div>
                  <div className="text-xs text-dark-500 mt-2">Poder adquisitivo</div>
              </div>
          </div>

          {/* Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(profile.areas) as LifeAreaName[]).map(areaKey => {
                  const area = profile.areas[areaKey];
                  const progress = (area.currentXp / (area.level * 100)) * 100;
                  return (
                      <div 
                        key={areaKey}
                        onClick={() => { setSelectedArea(areaKey); setActiveView('area'); }}
                        className="bg-dark-900 border border-dark-700 p-4 rounded-xl hover:bg-dark-800 transition-colors cursor-pointer group"
                      >
                          <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                  <div className="text-dark-400 group-hover:text-brand-500 transition-colors">
                                      {AREA_ICONS[areaKey]}
                                  </div>
                                  <span className="font-bold text-sm text-white">{area.name}</span>
                              </div>
                              <span className="text-xs font-mono text-dark-500">Lvl {area.level}</span>
                          </div>
                          <div className="w-full bg-dark-800 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-white/20 group-hover:bg-brand-500 transition-colors" style={{width: `${progress}%`}}></div>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>
  );

  const renderAreaDetail = () => {
      if (!selectedArea) return null;
      const area = profile.areas[selectedArea];
      const nextXp = area.level * 100;

      return (
          <div className="animate-fade-in h-full flex flex-col">
              <button onClick={() => setActiveView('overview')} className="flex items-center gap-2 text-dark-400 mb-6 hover:text-white transition-colors">
                  <ChevronLeft size={18} /> Volver al Tablero
              </button>

              <div className="bg-dark-900 border border-dark-700 p-6 rounded-2xl mb-6 text-center">
                  <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      {AREA_ICONS[selectedArea]}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedArea}</h2>
                  <p className="text-brand-500 font-mono text-sm mb-4">NIVEL {area.level}</p>
                  
                  <div className="w-full max-w-xs mx-auto bg-dark-800 h-2 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-brand-500" style={{width: `${(area.currentXp/nextXp)*100}%`}}></div>
                  </div>
                  <p className="text-xs text-dark-500 font-mono">{area.currentXp} / {nextXp} XP</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleHabit(selectedArea, 'positive')}
                    className="bg-dark-800 border border-dark-700 p-6 rounded-xl hover:bg-green-500/10 hover:border-green-500/50 transition-all group"
                  >
                      <div className="text-green-500 mb-2 font-bold group-hover:scale-110 transition-transform">+ HÁBITO POSITIVO</div>
                      <div className="text-xs text-dark-400 group-hover:text-green-400">
                          +10 XP <br/> +5 Energía <br/> +5 Créditos
                      </div>
                  </button>

                  <button 
                    onClick={() => handleHabit(selectedArea, 'negative')}
                    className="bg-dark-800 border border-dark-700 p-6 rounded-xl hover:bg-danger-500/10 hover:border-danger-500/50 transition-all group"
                  >
                      <div className="text-danger-500 mb-2 font-bold group-hover:scale-110 transition-transform">- FALLO / NEGATIVO</div>
                      <div className="text-xs text-dark-400 group-hover:text-danger-400">
                          -10 Energía <br/> Sin progreso
                      </div>
                  </button>
              </div>
          </div>
      );
  };

  const renderNarratorChat = () => (
      <div className="flex flex-col h-full bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="p-4 bg-dark-800 border-b border-dark-700 flex items-center gap-3">
              <Brain size={20} className="text-brand-500" />
              <div>
                  <h3 className="text-sm font-bold text-white">Oráculo del Sistema</h3>
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider">IA Narrativa</p>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-100 border border-dark-700'}`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isAiLoading && <div className="text-xs text-dark-500 animate-pulse ml-4">Analizando parámetros...</div>}
          </div>
          <div className="p-3 bg-dark-800 border-t border-dark-700 flex gap-2">
              <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="Consulta al sistema..."
              />
              <button onClick={handleSendMessage} className="bg-brand-600 p-2 rounded-lg text-white"><Send size={18} /></button>
          </div>
      </div>
  );

  const renderSocialHub = () => {
    const activePartner = matches.find(m => m.id === activePartnerId);
    const messages = activePartnerId ? (peerMessages[activePartnerId] || []) : [];

    return (
        <div className="flex h-full gap-4 overflow-hidden animate-fade-in">
            {/* Left Column: Match List */}
            <div className={`flex-1 md:flex-none md:w-80 flex flex-col bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-dark-700 bg-dark-800/50">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-brand-500"/>
                        Comunidad & Match
                    </h2>
                    <p className="text-xs text-dark-500 mt-1">Atletas con metas similares a las tuyas.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {matches.map(partner => (
                        <div 
                            key={partner.id}
                            onClick={() => setActivePartnerId(partner.id)}
                            className={`p-3 rounded-xl cursor-pointer border transition-all hover:bg-dark-800 ${
                                activePartnerId === partner.id ? 'bg-dark-800 border-brand-500/50 shadow-sm shadow-brand-500/10' : 'bg-transparent border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${partner.avatarColor} flex items-center justify-center text-white font-bold relative`}>
                                    {partner.username.substring(0,2).toUpperCase()}
                                    {partner.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full"></span>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-sm text-gray-200 truncate">{partner.username}</h4>
                                        {partner.matchPercentage >= 80 && (
                                            <span className="text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 rounded-md flex items-center gap-0.5">
                                                <Sparkles size={8} /> {partner.matchPercentage}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-dark-500 truncate">
                                        Lvl {partner.level} • {partner.goal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Chat & Profile */}
            {activePartnerId && activePartner ? (
                 <div className="flex-1 flex flex-col bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden">
                     {/* Chat Header with Progress Stats */}
                     <div className="p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                             <button onClick={() => setActivePartnerId(null)} className="md:hidden text-dark-400"><ChevronLeft/></button>
                             <div className={`w-10 h-10 rounded-full ${activePartner.avatarColor} flex items-center justify-center text-white font-bold`}>
                                 {activePartner.username.substring(0,2)}
                             </div>
                             <div>
                                 <h3 className="font-bold text-white leading-tight">{activePartner.username}</h3>
                                 <div className="flex items-center gap-2 text-[10px] text-brand-400 font-mono uppercase">
                                     <span>NIVEL {activePartner.level}</span>
                                     <span className="w-1 h-1 bg-dark-600 rounded-full"></span>
                                     <span>{activePartner.goal.replace('_', ' ')}</span>
                                 </div>
                             </div>
                         </div>
                         <div className="hidden sm:block text-right">
                             <div className="text-[10px] text-dark-500 uppercase font-bold">Afinidad</div>
                             <div className="text-lg font-bold text-white">{activePartner.matchPercentage}%</div>
                         </div>
                     </div>

                     {/* Chat Messages */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-900/50">
                         {messages.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-dark-500 opacity-50">
                                 <UserPlus size={48} className="mb-2"/>
                                 <p className="text-sm">Inicia la conversación con {activePartner.username}</p>
                             </div>
                         ) : (
                             messages.map(msg => (
                                 <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                                         msg.senderId === 'me' 
                                         ? 'bg-brand-600 text-white rounded-br-none' 
                                         : 'bg-dark-800 text-gray-200 border border-dark-700 rounded-bl-none'
                                     }`}>
                                         {msg.text}
                                         <div className={`text-[9px] mt-1 text-right ${msg.senderId === 'me' ? 'text-brand-200' : 'text-dark-500'}`}>{msg.timestamp}</div>
                                     </div>
                                 </div>
                             ))
                         )}
                     </div>

                     {/* Chat Input */}
                     <div className="p-3 bg-dark-800 border-t border-dark-700 flex gap-2">
                         <input 
                            value={socialInput}
                            onChange={(e) => setSocialInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendPeerMessage()}
                            className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                            placeholder={`Escribe a ${activePartner.username}...`}
                         />
                         <button 
                            onClick={handleSendPeerMessage}
                            disabled={!socialInput.trim()}
                            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                         >
                             <Send size={18} />
                         </button>
                     </div>
                 </div>
            ) : (
                // Desktop Placeholder when no chat selected
                <div className="hidden md:flex flex-1 bg-dark-900 border border-dark-700 rounded-2xl items-center justify-center text-center p-8">
                    <div className="max-w-xs text-dark-500">
                        <Users size={64} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white mb-2">Conecta con la Élite</h3>
                        <p className="text-sm">Selecciona un atleta de la lista. Nuestro algoritmo te sugiere compañeros con niveles y metas similares para maximizar el crecimiento mutuo.</p>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderShop = () => (
      <div className="space-y-6 animate-fade-in pb-24 h-full flex flex-col">
          {/* Shop Header */}
          <div className="bg-dark-900 border border-dark-700 p-6 rounded-xl flex items-center justify-between">
              <div>
                  <h2 className="text-xl font-bold text-white">Mercado de Balance</h2>
                  <p className="text-xs text-dark-400 mt-1">Invierte créditos en recuperación real.</p>
              </div>
              <div className="text-right">
                  <div className="text-2xl font-mono text-gold-400 font-bold">{profile.credits}</div>
                  <div className="text-[10px] uppercase tracking-wider text-dark-500">Créditos Disp.</div>
              </div>
          </div>
          
          {purchaseFeedback && (
              <div className="bg-brand-500/20 border border-brand-500/50 p-3 rounded-lg text-brand-200 text-sm text-center font-bold animate-pulse">
                  {purchaseFeedback}
              </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
              {SHOP_ITEMS.map(item => {
                  const canAfford = profile.credits >= item.cost;
                  return (
                      <button 
                        key={item.id}
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                            canAfford 
                            ? 'bg-dark-900 border-dark-700 hover:border-brand-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-dark-900/50 border-dark-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                          <div className="flex justify-between items-start mb-3">
                              <div className="p-3 bg-dark-800 rounded-lg group-hover:scale-110 transition-transform">
                                  {item.icon}
                              </div>
                              <div className={`font-mono font-bold text-sm ${canAfford ? 'text-gold-400' : 'text-red-400'}`}>
                                  {item.cost} CR
                              </div>
                          </div>
                          <h3 className="font-bold text-white mb-1">{item.name}</h3>
                          <p className="text-xs text-dark-400 mb-3 leading-relaxed">{item.description}</p>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1">
                              <Zap size={12} /> +{item.energyRestore} Energía
                          </div>
                      </button>
                  );
              })}
          </div>

          {/* Inventory / History (Simple Text) */}
          <div className="mt-4 border-t border-dark-800 pt-4">
              <h3 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">Historial de Transacciones</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {profile.inventory.length === 0 ? (
                      <p className="text-xs text-dark-600 italic">No hay compras recientes.</p>
                  ) : (
                      profile.inventory.map((log, i) => (
                          <div key={i} className="text-xs text-dark-400 font-mono border-b border-dark-800 pb-1 last:border-0">
                              {log}
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans flex flex-col">
        {/* WORLD HEADER */}
        <header className="flex-none p-4 flex justify-between items-center border-b border-dark-800 bg-dark-950/90 backdrop-blur sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center border border-white/10">
                    <span className="font-bold text-xs">W</span>
                </div>
                <h1 className="font-bold text-lg tracking-tight">MUNDO <span className="text-brand-500">MUSCLEPRO</span></h1>
            </div>
            <button 
                onClick={onExit}
                className="text-xs font-bold text-dark-400 hover:text-white border border-dark-700 px-3 py-1.5 rounded-full transition-colors"
            >
                SALIR AL CORE
            </button>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full overflow-hidden flex flex-col">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'area' && renderAreaDetail()}
            {activeView === 'narrator' && renderNarratorChat()}
            {activeView === 'social' && renderSocialHub()}
            {activeView === 'shop' && renderShop()}
        </div>

        {/* WORLD NAVIGATION */}
        <nav className="flex-none bg-dark-900 border-t border-dark-800 pb-safe">
            <div className="flex justify-around p-2">
                <NavBtn icon={<Target size={20}/>} label="Areas" active={activeView === 'overview' || activeView === 'area'} onClick={() => { setActiveView('overview'); setSelectedArea(null); }} />
                <NavBtn icon={<Users size={20}/>} label="Social" active={activeView === 'social'} onClick={() => setActiveView('social')} />
                <NavBtn icon={<MessageSquare size={20}/>} label="Oráculo" active={activeView === 'narrator'} onClick={() => setActiveView('narrator')} />
                <NavBtn icon={<ShoppingBag size={20}/>} label="Tienda" active={activeView === 'shop'} onClick={() => setActiveView('shop')} />
            </div>
        </nav>
    </div>
  );
};

const NavBtn = ({icon, label, active, onClick}: any) => (
    <button onClick={onClick} className={`flex flex-col items-center p-3 w-20 rounded-xl transition-colors ${active ? 'text-brand-500 bg-brand-500/10' : 'text-dark-500 hover:text-white'}`}>
        {icon}
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{label}</span>
    </button>
);
