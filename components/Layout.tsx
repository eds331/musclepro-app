
import React from 'react';
import { LayoutDashboard, Dumbbell, MessageSquare, User as UserIcon, LogOut, Settings, Activity, Globe, CalendarDays } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userRole: string;
  onEnterWorld: () => void; // NEW PROP
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, userRole, onEnterWorld }) => {
  return (
    <div className="flex h-screen w-full bg-dark-950 text-white overflow-hidden selection:bg-brand-500/30">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 bg-dark-950 border-r border-dark-800 p-6 flex-shrink-0">
        <div className="mb-10 px-2 flex justify-center">
           {/* LOGO CSS REPLACEMENT */}
           <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-brand-500 transform -rotate-12" size={28} />
                <h1 className="text-2xl font-black tracking-tighter text-white italic">
                    MUSCLE<span className="text-brand-500">PRO</span>
                </h1>
              </div>
              <span className="text-[9px] tracking-[0.4em] text-dark-500 mt-1 uppercase font-bold">PERFORMANCE</span>
           </div>
        </div>

        <nav className="flex-1 space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Inicio" 
              isActive={activeTab === 'dashboard'} 
              onClick={() => onTabChange('dashboard')} 
            />
            <SidebarItem 
              icon={<Activity size={20} />} 
              label="Progreso" 
              isActive={activeTab === 'progress'} 
              onClick={() => onTabChange('progress')} 
            />
            <SidebarItem 
              icon={<Dumbbell size={20} />} 
              label="Entrenar" 
              isActive={activeTab === 'workout'} 
              onClick={() => onTabChange('workout')} 
            />
             <SidebarItem 
              icon={<CalendarDays size={20} />} 
              label="Agenda" 
              isActive={activeTab === 'agenda'} 
              onClick={() => onTabChange('agenda')} 
            />
            <SidebarItem 
              icon={<MessageSquare size={20} />} 
              label="Coach IA" 
              isActive={activeTab === 'ai-chat'} 
              onClick={() => onTabChange('ai-chat')} 
            />
            
            {userRole === 'ADMIN' ? (
                <SidebarItem 
                  icon={<Settings size={20} />} 
                  label="Panel Admin" 
                  isActive={activeTab === 'admin'} 
                  onClick={() => onTabChange('admin')} 
                />
            ) : (
                <SidebarItem 
                  icon={<UserIcon size={20} />} 
                  label="Mi Perfil" 
                  isActive={activeTab === 'profile'} 
                  onClick={() => onTabChange('profile')} 
                />
            )}

            <div className="pt-8 mt-4 border-t border-dark-800">
                <button 
                  onClick={onEnterWorld}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-dark-800 to-dark-900 border border-dark-700 hover:border-brand-500/50 transition-all group"
                >
                    <Globe size={20} className="text-brand-500 group-hover:animate-pulse" />
                    <span className="font-bold text-sm text-gray-300 group-hover:text-white">Mundo MUSCLEPRO</span>
                </button>
            </div>
        </nav>

        <button 
          onClick={onLogout} 
          className="flex items-center gap-3 text-dark-500 hover:text-white transition-colors mt-auto pt-6 px-4 text-sm font-medium"
        >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-dark-950">
        
        {/* MOBILE FIXED HEADER WITH LOGO */}
        <header className="md:hidden flex-none h-16 bg-dark-950/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-center z-50 sticky top-0">
             <div className="flex items-center gap-2">
                <Dumbbell className="text-brand-500" size={20} />
                <h1 className="text-xl font-black tracking-tight text-white italic">
                  MUSCLE<span className="text-brand-500">PRO</span>
                </h1>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar w-full h-full pb-24 md:pb-0 scroll-smooth">
             <div className="w-full min-h-full mx-auto p-4 md:p-8 lg:max-w-6xl animate-fade-in">
                {children}
             </div>
        </div>

        {/* --- MOBILE BOTTOM NAV --- */}
        <nav className="md:hidden fixed bottom-0 w-full glass-nav h-[88px] flex items-start justify-around z-50 px-4 pt-4 pb-safe">
          <NavButton icon={<LayoutDashboard size={22} />} label="Hoy" isActive={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <NavButton icon={<CalendarDays size={22} />} label="Agenda" isActive={activeTab === 'agenda'} onClick={() => onTabChange('agenda')} />
          
          {/* Main Action Button */}
          <button 
            onClick={() => onTabChange('workout')}
            className="relative -top-8 bg-brand-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
          >
            <Dumbbell size={24} strokeWidth={2.5} />
          </button>

          <NavButton icon={<MessageSquare size={22} />} label="Coach" isActive={activeTab === 'ai-chat'} onClick={() => onTabChange('ai-chat')} />
          
          {/* World Entry Point Mobile */}
          <NavButton icon={<Globe size={22} />} label="Mundo" isActive={false} onClick={onEnterWorld} />
        </nav>
      </main>
    </div>
  );
};

// Sub-components
const SidebarItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 group ${
      isActive 
      ? 'bg-dark-900 text-brand-400 border border-dark-800' 
      : 'text-dark-500 hover:text-white hover:bg-dark-900/50'
    }`}
  >
    <span className={`${isActive ? 'text-brand-400' : 'group-hover:text-white'} transition-colors`}>{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${isActive ? 'text-brand-400' : 'text-dark-500'}`}
  >
    <div className={`mb-1 transition-transform ${isActive ? '-translate-y-1' : ''}`}>
        {icon}
    </div>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);
