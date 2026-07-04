import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FileText,
  Download,
  Users,
  CheckCircle,
  Briefcase,
  Loader,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export const Reports: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [stats, setStats] = useState<any>(null);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchFilterData = async () => {
    try {
      const projData = await api.get('/project');
      setProjects(projData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const query = selectedProjectId ? `?projectId=${selectedProjectId}` : '';
      const statsData = await api.get(`/report/stats${query}`);
      const workloadData = await api.get(`/report/workload${query}`);

      setStats(statsData);
      setWorkload(workloadData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedProjectId]);

  const handleExportCSV = async () => {
    setCsvLoading(true);
    try {
      const query = selectedProjectId ? `?projectId=${selectedProjectId}` : '';
      const csvContent = await api.get(`/report/csv${query}`);

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sprintnest-tasks-report-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV report');
    } finally {
      setCsvLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#10b981', '#6366f1'];
  const pieData = stats
    ? [
        { name: 'Completed Tasks', value: stats.doneTasks },
        { name: 'Pending Tasks', value: stats.totalTasks - stats.doneTasks },
      ]
    : [];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-500/5 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-sm">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-slate-350">Filter Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={csvLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-emerald-600/25 shrink-0"
        >
          {csvLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <Download size={16} />
              <span>Export Task CSV Report</span>
            </>
          )}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion summary stats cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 rounded-2xl border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalTasks}</h3>
              </div>
              <Briefcase className="text-indigo-500" size={28} />
            </div>

            <div className="glass-card p-5 rounded-2xl border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{stats.doneTasks}</h3>
              </div>
              <CheckCircle className="text-emerald-500" size={28} />
            </div>

            <div className="glass-card p-5 rounded-2xl border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                <h3 className="text-2xl font-bold mt-1">{stats.completionRate.toFixed(1)}%</h3>
              </div>
              <FileText className="text-purple-500" size={28} />
            </div>
          </div>

          {/* Visual charts display */}
          <div className="glass-card p-5 rounded-2xl border lg:col-span-2 flex flex-col justify-between h-72">
            <h4 className="font-bold text-sm mb-4">Task Completion Rate</h4>
            <div className="flex-1 w-full min-h-0 flex items-center justify-around">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-1/2 space-y-3 text-xs">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{entry.name}</span>
                    <span className="font-bold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Workload Analytics list */}
      <div className="glass-panel border rounded-2xl overflow-hidden space-y-4 p-5">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <Users size={18} className="text-indigo-500" />
          Developer Workload and Productivity metrics
        </h4>

        {workload.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No developer task assignments found.</p>
        ) : (
          <div className="overflow-x-auto text-xs font-semibold">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Developer</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Assigned Tasks</th>
                  <th className="py-3 px-2">Completed Tasks</th>
                  <th className="py-3 px-2">Productivity Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-slate-700 dark:text-slate-200">
                {workload.map((dev: any) => {
                  const pct = dev.tasks > 0 ? (dev.completed / dev.tasks) * 100 : 0;
                  return (
                    <tr key={dev.id} className="hover:bg-slate-500/2">
                      <td className="py-3 px-2 font-bold">{dev.name}</td>
                      <td className="py-3 px-2 text-slate-450 capitalize">{dev.role?.name || 'Developer'}</td>
                      <td className="py-3 px-2 text-slate-500">{dev.tasks}</td>
                      <td className="py-3 px-2 text-emerald-500">{dev.completed}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] bg-slate-500/20 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
