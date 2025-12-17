import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, Receipt, Sun, Moon, Settings } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children, isDarkMode, toggleTheme }) => {
  const navItems = [
    { id: 'dashboard' as ViewState, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as ViewState, label: 'Pacientes', icon: Users },
    { id: 'billing' as ViewState, label: 'Facturación', icon: Receipt },
    { id: 'settings' as ViewState, label: 'Datos', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-slate-700 dark:text-slate-200 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 flex flex-col bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-20 transition-all duration-300">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative group flex items-center gap-3">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
             
             {/* Logo Container */}
             <div className="relative bg-white rounded-full p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30 flex-shrink-0">
                <img 
                  src="logo.png" 
                  alt="Logo Maxima G.E" 
                  className="w-10 h-10 object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-slate-900 font-bold text-xs flex items-center justify-center w-10 h-10">G.E</span>';
                  }}
                />
             </div>

             <div className="hidden lg:flex flex-col">
                <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-300 dark:to-purple-400 leading-none">
                  MAXIMA
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-[0.2em]">
                  OPTICA G.E
                </span>
             </div>
          </div>
        </div>

        <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group
                ${currentView === item.id 
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'text-cyan-500 dark:text-cyan-400' : 'group-hover:text-slate-700 dark:group-hover:text-white'}`} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {currentView === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] hidden lg:block" />
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className="p-3">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-purple-600" />}
            <span className="hidden lg:block font-medium text-sm">
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>
        </div>

        <div className="p-4 text-xs text-center text-slate-500 dark:text-slate-600 hidden lg:block border-t border-slate-200 dark:border-slate-800">
          v1.1.0 • Optica System
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
