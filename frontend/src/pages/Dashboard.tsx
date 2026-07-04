import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-450 text-center max-w-md">
          <p className="font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { cards, upcomingDeadlines, recentActivity, charts } = data;

  const COLORS = ['#6366f1', '#f59e0b', '#a855f7', '#10b981'];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Projects</span>
            <FolderKanban size={22} />
          </div>
          <h3 className="text-3xl font-bold mt-2">{cards.activeProjects}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tasks</span>
            <Clock size={22} />
          </div>
          <h3 className="text-3xl font-bold mt-2">{cards.totalTasks}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Tasks</span>
            <CheckCircle size={22} />
          </div>
          <h3 className="text-3xl font-bold mt-2">{cards.completedTasks}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-32">
          <div className="flex justify-between items-start text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Tasks</span>
            <Clock size={22} />
          </div>
          <h3 className="text-3xl font-bold mt-2">{cards.pendingTasks}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-32 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start text-rose-600 dark:text-rose-450">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Incident Reports</span>
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-3xl font-bold mt-2">{cards.incidents}</h3>
        </div>
      </div>

      {/* Main Charts & Deadlines Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* Weekly Progress & Task Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly completed tasks */}
            <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-80">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-500" />
                  Weekly Progress
                </h4>
                <span className="text-xs text-slate-500">Completed tasks last 7 days</span>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.weeklyProgress}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tasks Status Distribution */}
            <div className="glass-card p-5 rounded-2xl border flex flex-col justify-between h-80">
              <div className="mb-2">
                <h4 className="font-bold text-sm">Tasks Status Distribution</h4>
              </div>
              <div className="flex-1 w-full min-h-0 flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.taskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {charts.taskDistribution.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4 space-y-2">
                  {charts.taskDistribution.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                      <span className="font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                      <span className="font-bold ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Workload chart */}
          <div className="glass-card p-5 rounded-2xl border h-80 flex flex-col">
            <h4 className="font-bold text-sm mb-4">Top Developer Task Workloads</h4>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.teamWorkload}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned Tasks" />
                  <Bar dataKey="done" fill="#10b981" radius={[4, 4, 0, 0]} name="Done Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Deadlines & Activity Feed */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="glass-card p-5 rounded-2xl border flex flex-col h-80">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-amber-500" />
              Upcoming Deadlines
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {upcomingDeadlines.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No upcoming deadlines!
                </div>
              ) : (
                upcomingDeadlines.map((task: any) => (
                  <div key={task.id} className="p-3 rounded-xl border border-slate-500/10 hover:border-slate-500/20 bg-slate-500/3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{task.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-medium" style={{ backgroundColor: `${task.project.themeColor}20`, color: task.project.themeColor }}>
                        {task.project.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-1">Assignee: {task.assignee?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="glass-card p-5 rounded-2xl border flex flex-col h-[344px]">
            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
              <Activity size={18} className="text-indigo-500" />
              Recent Workspace Activity
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {recentActivity.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No recent activities recorded.
                </div>
              ) : (
                recentActivity.map((log: any) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-normal">
                    <div className="w-7 h-7 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                      {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.user?.name || 'System'}{' '}
                        <span className="text-slate-400 font-normal">
                          {log.action.replace('_', ' ').toLowerCase()}
                        </span>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{log.details}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
