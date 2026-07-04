import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.accessToken, data.refreshToken, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-indigo-500/20">
            S
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back to SprintNest
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to access your team workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-350">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@sprintnest.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-350">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
