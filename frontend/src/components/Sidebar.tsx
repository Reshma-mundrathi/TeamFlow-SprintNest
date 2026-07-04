import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'RCA Incidents', path: '/rca-incidents', icon: AlertTriangle },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`glass-panel border-r flex flex-col justify-between transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo and toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25 shrink-0">
              S
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent truncate">
                SprintNest
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-850/50 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Card */}
        {!collapsed && user && (
          <div className="m-4 p-3 rounded-xl bg-slate-500/5 dark:bg-slate-400/5 border border-slate-500/10 flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold flex items-center justify-center shrink-0 border border-indigo-500/20">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                <Sparkles size={10} className="text-indigo-500" />
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};
