import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Calendar, ArrowRight, UserPlus, X, Loader, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Project Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [dueDate, setDueDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isManagerOrAdmin =
    user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'admin';

  const fetchData = async () => {
    try {
      const data = await api.get('/project');
      setProjects(data);

      if (isManagerOrAdmin) {
        const usersList = await api.get('/user');
        setUsers(usersList);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const newProj = await api.post('/project', {
        name,
        description,
        themeColor,
        dueDate: dueDate ? new Date(dueDate) : null,
        memberIds: selectedMembers,
      });

      setProjects((prev) => [newProj, ...prev]);
      setShowCreateModal(false);
      // Reset form
      setName('');
      setDescription('');
      setThemeColor('#6366f1');
      setDueDate('');
      setSelectedMembers([]);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create project.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const PRESET_COLORS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Purple
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projects Board</h2>
          <p className="text-xs text-slate-500">Track and manage collaborative developer workspaces</p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-600/25"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border text-slate-500">
          <FolderKanban size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="font-semibold text-lg">No projects active</p>
          <p className="text-sm">Get started by creating a new team workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card rounded-2xl border overflow-hidden flex flex-col justify-between"
              style={{ borderTop: `4px solid ${proj.themeColor}` }}
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-slate-850 dark:text-slate-100 truncate">
                    {proj.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 h-8">{proj.description || 'No description provided.'}</p>

                <div className="flex items-center gap-2 text-xs text-slate-550 dark:text-slate-400">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Due: {proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : 'No limit'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-550 dark:text-slate-400">
                  <Users size={14} className="text-slate-400" />
                  <span>Members: {proj.members?.length || 0}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-500/3 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Manager: {proj.manager?.name}</span>
                <Link
                  to={`/projects/${proj.id}/tasks`}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Tasks</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/10 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
              <h3 className="font-bold text-lg">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. API Gateway Redesign"
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe project deliverables..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Theme Color</label>
                  <div className="flex gap-2 items-center h-10">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setThemeColor(col)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          themeColor === col ? 'border-white scale-125' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-350 flex items-center gap-1">
                  <UserPlus size={16} />
                  Workspace Members
                </label>
                <div className="border border-slate-200/55 dark:border-slate-700/50 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1">
                  {users.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2 text-center">No team members registered.</p>
                  ) : (
                    users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleToggleMember(u.id)}
                        className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                          selectedMembers.includes(u.id)
                            ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'hover:bg-slate-500/5 text-slate-650 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs">{u.name} ({u.role?.name})</span>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(u.id)}
                          onChange={() => {}}
                          className="rounded text-indigo-600 pointer-events-none"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200/55 dark:border-slate-700/50 rounded-xl hover:bg-slate-550/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  {formLoading ? <Loader size={16} className="animate-spin" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
