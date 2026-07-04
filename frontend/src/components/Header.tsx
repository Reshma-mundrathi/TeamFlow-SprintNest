import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { io, Socket } from 'socket.io-client';
import { Bell, Sun, Moon, Check, CheckCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/rca-incidents')) return 'RCA Incident Investigations';
    if (path.startsWith('/reports')) return 'Reports & Workloads';
    if (path.startsWith('/settings')) return 'Settings';
    return 'SprintNest';
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notification');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Connect to WebSocket server
      const socketUrl = 'http://localhost:3001';
      const socket = io(socketUrl, {
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('register', user.id);
      });

      socket.on('notification', (newNotif: any) => {
        setNotifications((prev) => [newNotif, ...prev]);
        // Trigger notification sound if desired
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
          audio.volume = 0.3;
          audio.play();
        } catch (e) {
          // browser blocks autoplay occasionally
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notification/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notification/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 px-6 flex items-center justify-between shrink-0 glass-panel z-20">
      <h1 className="text-xl font-bold m-0 p-0 text-slate-850 dark:text-slate-100">
        {getPageTitle()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-500/10 transition-colors text-slate-600 dark:text-slate-350 cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl hover:bg-slate-500/10 transition-colors text-slate-600 dark:text-slate-350 relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden text-sm z-50">
              <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
                <span className="font-semibold text-slate-850 dark:text-slate-150">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/40 dark:divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors hover:bg-slate-500/5 flex gap-2 justify-between items-start ${
                        !notif.isRead ? 'bg-indigo-500/5 dark:bg-indigo-500/3' : ''
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className={`font-medium text-xs ${!notif.isRead ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-850 dark:text-slate-200'}`}>
                          {notif.title}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal truncate-multiline">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile indicator */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200/50 dark:border-slate-800/50 pl-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/20">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
