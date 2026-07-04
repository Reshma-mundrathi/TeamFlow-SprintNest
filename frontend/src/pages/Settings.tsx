import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Lock, Loader, Check, Sun, Moon } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, theme, toggleTheme } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      await api.put(`/user/${user.id}`, { name, email });
      setProfileSuccess(true);
      // Automatically clear success banner after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put(`/user/${user.id}/password`, {
        oldPassword: currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Workspace Settings</h2>
        <p className="text-xs text-slate-500">Configure profile, account credentials, and theme settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Profile Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <User size={18} className="text-indigo-500" />
            Profile Configuration
          </h4>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-1">
              <Check size={14} />
              Profile updated successfully!
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-350">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohith G"
                className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-350">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@sprintnest.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
            >
              {profileLoading ? <Loader size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="glass-panel p-5 rounded-2xl border space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <Lock size={18} className="text-indigo-500" />
            Security & Password
          </h4>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-1">
              <Check size={14} />
              Password updated successfully!
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-350">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-350">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-350">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
            >
              {passwordLoading ? <Loader size={16} className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Theme Toggling Section */}
      <div className="glass-panel p-5 rounded-2xl border space-y-4 max-w-md">
        <h4 className="font-bold flex items-center gap-2 text-sm">
          {theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
          Display Preferences
        </h4>
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Switch between dark and light modes for optimal eye care during long sprint reviews.
        </p>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-semibold rounded-xl cursor-pointer transition-colors border border-slate-200/55 dark:border-slate-700/50"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-500" />
              <span>Switch to Light Theme</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-600" />
              <span>Switch to Dark Theme</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
