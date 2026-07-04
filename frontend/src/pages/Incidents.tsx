import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  AlertTriangle,
  X,
  Loader,
  ExternalLink,
} from 'lucide-react';

export const Incidents: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [projectId, setProjectId] = useState('');
  const [timeline, setTimeline] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [prevention, setPrevention] = useState('');
  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecContent, setNewSecContent] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isManagerOrAdmin =
    user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'admin';

  const fetchData = async () => {
    try {
      const incData = await api.get('/incident');
      setIncidents(incData);

      const projData = await api.get('/project');
      setProjects(projData);
    } catch (err: any) {
      setError(err.message || 'Failed to load incidents data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setFormError('Please select a project');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const data = await api.post('/incident', {
        title,
        severity,
        projectId,
        timeline,
        rootCause,
        resolution,
        prevention,
        status: 'DRAFT',
        sections,
      });

      setIncidents((prev) => [data, ...prev]);
      setShowCreateModal(false);
      // Reset
      setTitle('');
      setSeverity('MEDIUM');
      setProjectId('');
      setTimeline('');
      setRootCause('');
      setResolution('');
      setPrevention('');
      setSections([]);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create Incident Report.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddSection = () => {
    if (!newSecTitle.trim() || !newSecContent.trim()) return;
    setSections((prev) => [...prev, { title: newSecTitle, content: newSecContent }]);
    setNewSecTitle('');
    setNewSecContent('');
  };

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStatus = async (incidentId: string, nextStatus: string) => {
    try {
      const data = await api.put(`/incident/${incidentId}`, { status: nextStatus });
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? data : inc)));
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === 'CRITICAL') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    if (sev === 'HIGH') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (sev === 'MEDIUM') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
  };

  const getStatusStyle = (status: string) => {
    if (status === 'CLOSED') return 'bg-slate-500/10 text-slate-550';
    if (status === 'APPROVED') return 'bg-emerald-500/10 text-emerald-500';
    if (status === 'SUBMITTED') return 'bg-purple-500/10 text-purple-550';
    return 'bg-blue-500/10 text-blue-550';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">RCA Incidents</h2>
          <p className="text-xs text-slate-500">Document system bugs, outage root causes, timelines, and resolution preventive measures</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-600/25"
        >
          <Plus size={18} />
          <span>New RCA Incident</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* Incidents table/list */}
      {incidents.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border text-slate-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="font-semibold text-lg">No RCA Incident logs</p>
          <p className="text-sm">Create an RCA Incident report when tracking runtime errors or site outages.</p>
        </div>
      ) : (
        <div className="glass-panel border rounded-2xl overflow-hidden divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs">
          <div className="p-3.5 bg-slate-500/5 flex items-center font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-1/3">RCA Incident Title</div>
            <div className="w-1/6">Severity</div>
            <div className="w-1/6">Workflow Status</div>
            <div className="w-1/6">Project</div>
            <div className="w-1/6 text-right">Details</div>
          </div>

          {incidents.map((inc) => (
            <div key={inc.id} className="p-3.5 hover:bg-slate-500/3 flex items-center transition-colors font-medium">
              <div className="w-1/3 font-semibold text-slate-800 dark:text-slate-100 truncate pr-4">{inc.title}</div>
              <div className="w-1/6">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityStyle(inc.severity)}`}>
                  {inc.severity}
                </span>
              </div>
              <div className="w-1/6">
                <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize ${getStatusStyle(inc.status)}`}>
                  {inc.status.toLowerCase()}
                </span>
              </div>
              <div className="w-1/6 text-slate-550 dark:text-slate-400">{inc.project?.name}</div>
              <div className="w-1/6 text-right">
                <button
                  onClick={() => {
                    setSelectedIncident(inc);
                    setShowDetailsModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200/55 dark:border-slate-700/50 hover:bg-slate-550/10 cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <span>Open Report</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-white/10 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
              <h3 className="font-bold text-lg">Create RCA Incident Report</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">RCA Incident Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Database Connection Timeout during spike"
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Low</option>
                    <option value="MEDIUM" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Medium</option>
                    <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">High</option>
                    <option value="CRITICAL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Project</label>
                  <select
                    value={projectId}
                    required
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Incident Timeline</label>
                <textarea
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="E.g. 14:05 Spike starts, 14:08 Connection errors begin..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Root Cause</label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Identify core issue detail..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Resolution</label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Steps taken to resolve..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Prevention</label>
                  <textarea
                    value={prevention}
                    onChange={(e) => setPrevention(e.target.value)}
                    placeholder="Action items to prevent recurrence..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Section builder */}
              <div className="space-y-3 pt-3 border-t border-slate-250/25">
                <label className="font-bold text-xs text-slate-400">Additional Report Sections</label>
                <div className="space-y-2">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-500/10 bg-slate-500/3 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-xs">{sec.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{sec.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end bg-slate-500/5 p-3 rounded-xl">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={newSecTitle}
                      onChange={(e) => setNewSecTitle(e.target.value)}
                      placeholder="Section title (e.g. Impacts)"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <textarea
                      value={newSecContent}
                      onChange={(e) => setNewSecContent(e.target.value)}
                      placeholder="Section details..."
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="w-full py-2 bg-slate-250/20 hover:bg-slate-250/30 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Add Custom Section
                  </button>
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
                  {formLoading ? <Loader size={16} className="animate-spin" /> : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Details / Approval Dialog */}
      {showDetailsModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel rounded-3xl border border-white/10 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-sm">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getSeverityStyle(selectedIncident.severity)}`}>
                  {selectedIncident.severity}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${getStatusStyle(selectedIncident.status)}`}>
                  {selectedIncident.status.toLowerCase()}
                </span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Heading */}
              <div>
                <h3 className="text-xl font-bold leading-tight">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Reporter: {selectedIncident.reporter?.name} | Project: {selectedIncident.project?.name}</p>
              </div>

              {/* Grid items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/3 space-y-1">
                  <h4 className="font-semibold text-xs text-slate-400">RCA Incident Timeline</h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed">{selectedIncident.timeline || 'No timeline logged.'}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/3 space-y-1">
                  <h4 className="font-semibold text-xs text-slate-400">Root Cause</h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed">{selectedIncident.rootCause || 'No root cause identified.'}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/3 space-y-1">
                  <h4 className="font-semibold text-xs text-slate-400">Resolution Status</h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed">{selectedIncident.resolution || 'No resolution details logged.'}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/3 space-y-1">
                  <h4 className="font-semibold text-xs text-slate-400">Preventive Measures</h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed">{selectedIncident.prevention || 'No prevention plan logged.'}</p>
                </div>
              </div>

              {/* Sections list */}
              {selectedIncident.sections?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-250/20">
                  <h4 className="font-bold text-xs text-slate-450">Additional Details</h4>
                  <div className="space-y-4">
                    {selectedIncident.sections.map((sec: any) => (
                      <div key={sec.id} className="space-y-1">
                        <h5 className="font-bold text-slate-700 dark:text-slate-200 text-xs">{sec.title}</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{sec.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            {isManagerOrAdmin && (
              <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-end gap-3 bg-slate-500/5">
                {selectedIncident.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'SUBMITTED')}
                    className="px-4 py-2 border border-slate-200/55 dark:border-slate-700/50 rounded-xl hover:bg-slate-550/15 cursor-pointer font-semibold"
                  >
                    Submit Report
                  </button>
                )}
                {selectedIncident.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'APPROVED')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer font-semibold shadow-lg shadow-indigo-600/20"
                  >
                    Approve Report
                  </button>
                )}
                {selectedIncident.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'CLOSED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer font-semibold shadow-lg shadow-emerald-600/20"
                  >
                    Close RCA Incident
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
