
import React from 'react';
import { LayoutDashboard, Dumbbell, User as UserIcon, LogOut, Activity, CalendarDays, ShieldCheck, CloudCheck, CloudUpload } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userRole: string;
  isSyncing: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, userRole, isSyncing }) => {
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="flex h-screen w-full bg-dark-950 text-white overflow-hidden selection:bg-brand-500/30">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 bg-dark-950 border-r border-dark-800 p-6 flex-shrink-0">
        <div className="mb-10 px-2 flex justify-center">
           <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-brand-500 transform -rotate-12" size={28} />
                <h1 className="text-2xl font-black tracking-tighter text-white italic">
                    MUSCLE<span className="text-brand-500">PRO</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] tracking-[0.4em] text-dark-500 uppercase font-bold">ELITE PERFORMANCE</span>
                {isSyncing ? (
                    <CloudUpload size={10} className="text-brand-500 animate-pulse" />
                ) : (
                    <CloudCheck size={10} className="text-success-500" />
                )}
              </div>
           </div>
        </div>

        <nav className="flex-1 space-y-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Inicio" isActive={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
            <SidebarItem icon={<Activity size={20} />} label="Progreso" isActive={activeTab === 'progress'} onClick={() => onTabChange('progress')} />
            <SidebarItem icon={<Dumbbell size={20} />} label="Entrenar" isActive={activeTab === 'workout'} onClick={() => onTabChange('workout')} />
            <SidebarItem icon={<CalendarDays size={20} />} label="Agenda" isActive={activeTab === 'agenda'} onClick={() => onTabChange('agenda')} />
            {isAdmin && (
              <SidebarItem icon={<ShieldCheck size={20} className="text-brand-500" />} label="Admin Hub" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />
            )}
            <SidebarItem icon={<UserIcon size={20} />} label="Mi Perfil" isActive={activeTab === 'profile'} onClick={() => onTabChange('profile')} />
        </nav>

        <button onClick={onLogout} className="flex items-center gap-3 text-dark-500 hover:text-red-400 transition-colors mt-auto pt-6 px-4 text-sm font-medium border-t border-dark-800">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-dark-950">
        
        {/* MOBILE FIXED HEADER */}
        <header className="md:hidden flex-none h-16 bg-dark-950/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-between z-50 sticky top-0 px-6">
             <div className="w-8"></div> {/* Spacer */}
             <div className="flex items-center gap-2">
                <Dumbbell className="text-brand-500" size={20} />
                <h1 className="text-xl font-black tracking-tight text-white italic">
                  MUSCLE<span className="text-brand-500">PRO</span>
                </h1>
             </div>
             <div className="w-8 flex justify-end">
                {isSyncing ? (
                    <CloudUpload size={18} className="text-brand-500 animate-bounce" />
                ) : (
                    <CloudCheck size={18} className="text-success-500" />
                )}
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
          {isAdmin ? (
            <NavButton icon={<ShieldCheck size={22} className="text-brand-500" />} label="Admin" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />
          ) : (
            <NavButton icon={<CalendarDays size={22} />} label="Agenda" isActive={activeTab === 'agenda'} onClick={() => onTabChange('agenda')} />
          )}
          <button onClick={() => onTabChange('workout')} className="relative -top-8 bg-brand-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform">
            <Dumbbell size={24} strokeWidth={2.5} />
          </button>
          <NavButton icon={<Activity size={22} />} label="Progreso" isActive={activeTab === 'progress'} onClick={() => onTabChange('progress')} />
          <NavButton icon={<UserIcon size={22} />} label="Perfil" isActive={activeTab === 'profile'} onClick={() => onTabChange('profile')} />
        </nav>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-dark-900 text-brand-400 border border-dark-800' : 'text-dark-500 hover:text-white hover:bg-dark-900/50'}`}>
    <span className={`${isActive ? 'text-brand-400' : 'group-hover:text-white'} transition-colors`}>{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${isActive ? 'text-brand-400' : 'text-dark-500'}`}>
    <div className={`mb-1 transition-transform ${isActive ? '-translate-y-1' : ''}`}>{icon}</div>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);
