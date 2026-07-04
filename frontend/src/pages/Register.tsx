import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Mail, Lock, User, Sparkles, ArrowRight, Loader } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('Developer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password, roleName });
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Join SprintNest
          </h2>
          <p className="text-sm text-slate-400">
            Create your account to start collaborating
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-350">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohith G"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-350">Workspace Role</label>
            <div className="relative">
              <Sparkles className="absolute left-4 top-3 text-slate-500" size={18} />
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 focus:border-indigo-500 focus:outline-none transition-colors text-sm appearance-none cursor-pointer text-slate-300"
              >
                <option value="Developer" className="bg-slate-900 text-white">Developer</option>
                <option value="Manager" className="bg-slate-900 text-white">Manager</option>
                <option value="Admin" className="bg-slate-900 text-white">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
