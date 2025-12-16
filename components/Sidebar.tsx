import React from 'react';
import { LayoutDashboard, Users, FileInput, Settings, Dumbbell } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'classes', label: 'Classes', icon: Dumbbell },
    { id: 'import', label: 'Smart Import', icon: FileInput },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex z-10">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Users className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">ClassTrack</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center px-2">
          <img 
            src="https://picsum.photos/100/100" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <div className="ml-3">
            <p className="text-xs font-semibold text-slate-700">Jane Coach</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;