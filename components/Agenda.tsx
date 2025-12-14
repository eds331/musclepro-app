
import React, { useState } from 'react';
import { User, AgendaItem, AgendaItemType } from '../types';
import { Calendar as CalendarIcon, Clock, Check, Trash2, Plus, RefreshCw, Briefcase, CheckSquare, Bell, UserCheck } from 'lucide-react';

interface AgendaProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const Agenda: React.FC<AgendaProps> = ({ user, onUpdateUser }) => {
  const [newItem, setNewItem] = useState<{title: string, date: string, time: string, type: AgendaItemType}>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'TASK'
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filter and Sorting
  const sortedAgenda = [...user.agenda].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const today = new Date().toISOString().split('T')[0];
  const todayItems = sortedAgenda.filter(i => i.date === today);
  const upcomingItems = sortedAgenda.filter(i => i.date > today);
  const pastItems = sortedAgenda.filter(i => i.date < today);

  const handleAddItem = () => {
    if (!newItem.title) return;
    
    const item: AgendaItem = {
      id: Date.now().toString(),
      ...newItem,
      completed: false,
      isGoogleEvent: false
    };

    onUpdateUser({
      ...user,
      agenda: [...user.agenda, item]
    });

    setNewItem({ ...newItem, title: '' });
  };

  const toggleComplete = (id: string) => {
    const updatedAgenda = user.agenda.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateUser({ ...user, agenda: updatedAgenda });
  };

  const deleteItem = (id: string) => {
    const updatedAgenda = user.agenda.filter(item => item.id !== id);
    onUpdateUser({ ...user, agenda: updatedAgenda });
  };

  const handleGoogleSync = () => {
    setIsSyncing(true);
    setSyncMessage("Conectando con Google Calendar API...");

    // Simulation of Google API Sync
    setTimeout(() => {
        const mockGoogleEvents: AgendaItem[] = [
            { 
                id: `g_${Date.now()}_1`, 
                title: 'Revisión Trimestral (Google Meet)', 
                date: today, 
                time: '14:30', 
                type: 'MEETING', 
                completed: false, 
                isGoogleEvent: true 
            },
            { 
                id: `g_${Date.now()}_2`, 
                title: 'Dentista', 
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
                time: '11:00', 
                type: 'REMINDER', 
                completed: false, 
                isGoogleEvent: true 
            }
        ];

        // Filter duplicates loosely based on title/time to avoid mess in mock
        const currentIds = new Set(user.agenda.map(a => a.id));
        const newEvents = mockGoogleEvents.filter(e => !currentIds.has(e.id));

        onUpdateUser({
            ...user,
            agenda: [...user.agenda, ...newEvents]
        });

        setIsSyncing(false);
        setSyncMessage(`✅ Sincronizado: ${newEvents.length} eventos nuevos importados.`);
        setTimeout(() => setSyncMessage(null), 3000);
    }, 2500);
  };

  const getTypeIcon = (type: AgendaItemType) => {
      switch(type) {
          case 'MEETING': return <Briefcase size={16} className="text-purple-400" />;
          case 'TASK': return <CheckSquare size={16} className="text-brand-400" />;
          case 'REMINDER': return <Bell size={16} className="text-yellow-400" />;
          case 'APPOINTMENT': return <UserCheck size={16} className="text-pink-500" />;
      }
  };

  const renderItem = (item: AgendaItem) => (
    <div key={item.id} className={`p-4 rounded-xl border mb-3 flex items-center justify-between transition-all ${
        item.completed 
        ? 'bg-dark-900/50 border-dark-800 opacity-50' 
        : 'bg-dark-900 border-dark-700 hover:border-brand-500/50'
    }`}>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => toggleComplete(item.id)}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-dark-600 hover:border-brand-500'
                }`}
            >
                {item.completed && <Check size={14} className="text-black font-bold" />}
            </button>
            
            <div>
                <h4 className={`font-medium ${item.completed ? 'line-through text-dark-500' : 'text-white'}`}>
                    {item.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-dark-500 mt-1">
                    <span className="flex items-center gap-1">
                        {getTypeIcon(item.type)} {item.type === 'APPOINTMENT' ? 'CITA' : item.type}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {item.time}
                    </span>
                    {item.date !== today && (
                         <span className="flex items-center gap-1">
                            <CalendarIcon size={12} /> {item.date}
                        </span>
                    )}
                    {item.isGoogleEvent && (
                        <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold">G-CAL</span>
                    )}
                </div>
            </div>
        </div>
        
        <button onClick={() => deleteItem(item.id)} className="text-dark-600 hover:text-red-500 transition-colors p-2">
            <Trash2 size={16} />
        </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-light text-white">Tu <span className="font-bold">Agenda</span></h1>
            <p className="text-dark-500 text-sm">Organiza tu día, sincroniza tu vida.</p>
        </div>
        <button 
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 disabled:opacity-70 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sync Google Calendar'}
        </button>
      </div>

      {syncMessage && (
          <div className="bg-brand-500/10 border border-brand-500/50 p-3 rounded-lg text-brand-300 text-sm text-center">
              {syncMessage}
          </div>
      )}

      {/* Add Item Form */}
      <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-end md:items-center">
          <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] uppercase font-bold text-dark-500">Título</label>
              <input 
                type="text" 
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                placeholder="Nueva tarea o evento..."
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
              />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-dark-500">Fecha</label>
                  <input 
                    type="date" 
                    value={newItem.date}
                    onChange={e => setNewItem({...newItem, date: e.target.value})}
                    className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                  />
             </div>
             <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-dark-500">Hora</label>
                  <input 
                    type="time" 
                    value={newItem.time}
                    onChange={e => setNewItem({...newItem, time: e.target.value})}
                    className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                  />
             </div>
          </div>
          <div className="space-y-1 w-full md:w-auto">
              <label className="text-[10px] uppercase font-bold text-dark-500">Tipo</label>
              <select
                value={newItem.type}
                onChange={e => setNewItem({...newItem, type: e.target.value as AgendaItemType})}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none appearance-none"
              >
                  <option value="TASK">Tarea</option>
                  <option value="MEETING">Reunión</option>
                  <option value="APPOINTMENT">Cita</option>
                  <option value="REMINDER">Recordatorio</option>
              </select>
          </div>
          <button 
            onClick={handleAddItem}
            className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
              <Plus size={20} />
          </button>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
              <h3 className="text-brand-500 text-xs font-bold uppercase tracking-widest border-b border-dark-800 pb-2">
                  Para Hoy ({todayItems.length})
              </h3>
              {todayItems.length > 0 ? todayItems.map(renderItem) : (
                  <p className="text-dark-600 text-sm italic">Nada pendiente para hoy.</p>
              )}

              <h3 className="text-dark-400 text-xs font-bold uppercase tracking-widest border-b border-dark-800 pb-2 pt-4">
                  Próximos Eventos
              </h3>
              {upcomingItems.length > 0 ? upcomingItems.map(renderItem) : (
                  <p className="text-dark-600 text-sm italic">Calendario despejado.</p>
              )}
          </div>

          <div className="space-y-4 opacity-70">
              <h3 className="text-dark-500 text-xs font-bold uppercase tracking-widest border-b border-dark-800 pb-2">
                  Historial / Pasado
              </h3>
               {pastItems.length > 0 ? pastItems.map(renderItem) : (
                  <p className="text-dark-600 text-sm italic">Sin eventos pasados.</p>
              )}
          </div>
      </div>

    </div>
  );
};
