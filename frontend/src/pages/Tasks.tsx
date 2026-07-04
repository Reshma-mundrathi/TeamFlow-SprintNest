import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Calendar,
  CheckSquare,
  Paperclip,
  MessageSquare,
  AlertCircle,
  X,
  Loader,
  User,
  Clock,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Selected Task for Details Modal
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsWarning, setDetailsWarning] = useState<string | null>(null);

  // Create Task State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [parentId, setParentId] = useState('');
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  // Subtask Form State
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  // Comment Form State
  const [newCommentContent, setNewCommentContent] = useState('');
  // File Attachment State
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // User checks
  const isManagerOrAdmin =
    user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'admin';

  const fetchProjectAndTasks = async () => {
    try {
      const projData = await api.get(`/project/${projectId}`);
      setProject(projData);
      setProjectMembers(projData.members?.map((m: any) => m.user) || []);

      const tasksData = await api.get(`/task/project/${projectId}`);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const handleOpenDetails = async (task: any) => {
    try {
      const taskDetails = await api.get(`/task/${task.id}`);
      setSelectedTask(taskDetails);
      setShowDetailsModal(true);

      // Check warnings initially
      checkTaskWarnings(taskDetails);
    } catch (err) {
      console.error(err);
    }
  };

  const checkTaskWarnings = (taskDetails: any) => {
    let warn = null;
    if (taskDetails.parent && taskDetails.parent.status !== 'DONE') {
      warn = `Warning: Parent task "${taskDetails.parent.title}" is unfinished.`;
    }
    const incompleteDeps = taskDetails.dependencies?.filter(
      (dep: any) => dep.blockingTask.status !== 'DONE',
    );
    if (incompleteDeps && incompleteDeps.length > 0) {
      const depTitles = incompleteDeps.map((d: any) => `"${d.blockingTask.title}"`).join(', ');
      warn = warn
        ? `${warn} Also, blocking task dependencies are incomplete: ${depTitles}`
        : `Warning: The following blocking task dependencies are unfinished: ${depTitles}`;
    }
    setDetailsWarning(warn);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const newTask = await api.post('/task', {
        title,
        description,
        priority,
        projectId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        parentId: parentId || null,
        dependencyIds: selectedDependencyIds,
      });

      setTasks((prev) => [newTask, ...prev]);
      setShowCreateModal(false);
      // Reset
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      setAssigneeId('');
      setParentId('');
      setSelectedDependencyIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await api.put(`/task/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: res.task.status } : t)),
      );
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(res.task);
        checkTaskWarnings(res.task);
      }
      if (res.warning) {
        alert(res.warning);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddDependency = async (blockingTaskId: string) => {
    if (!blockingTaskId || !selectedTask) return;
    try {
      const currentDeps = selectedTask.dependencies || [];
      const newDependencyIds = [
        ...currentDeps.map((d: any) => d.blockingTaskId),
        blockingTaskId,
      ];

      const res = await api.put(`/task/${selectedTask.id}`, {
        dependencyIds: newDependencyIds,
      });

      setSelectedTask(res.task);
      checkTaskWarnings(res.task);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, dependencies: res.task.dependencies } : t,
        ),
      );
    } catch (err: any) {
      alert(err.message || 'Failed to add dependency');
    }
  };

  const handleRemoveDependency = async (blockingTaskId: string) => {
    if (!selectedTask) return;
    try {
      const currentDeps = selectedTask.dependencies || [];
      const newDependencyIds = currentDeps
        .map((d: any) => d.blockingTaskId)
        .filter((id: string) => id !== blockingTaskId);

      const res = await api.put(`/task/${selectedTask.id}`, {
        dependencyIds: newDependencyIds,
      });

      setSelectedTask(res.task);
      checkTaskWarnings(res.task);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, dependencies: res.task.dependencies } : t,
        ),
      );
    } catch (err: any) {
      alert(err.message || 'Failed to remove dependency');
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;

    try {
      const sub = await api.post('/task', {
        title: newSubtaskTitle,
        projectId,
        parentId: selectedTask.id,
      });

      // Reload selected task details
      const updatedTask = await api.get(`/task/${selectedTask.id}`);
      setSelectedTask(updatedTask);
      setTasks((prev) => [sub, ...prev]);
      setNewSubtaskTitle('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.put(`/task/${subtaskId}`, { status: nextStatus });
      const updatedTask = await api.get(`/task/${selectedTask.id}`);
      setSelectedTask(updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === subtaskId ? { ...t, status: nextStatus } : t)),
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !selectedTask) return;

    try {
      const comment = await api.post(`/task/${selectedTask.id}/comment`, {
        content: newCommentContent,
      });

      setSelectedTask((prev: any) => ({
        ...prev,
        comments: [comment, ...(prev.comments || [])],
      }));
      setNewCommentContent('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload || !selectedTask) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const att = await api.post(`/task/${selectedTask.id}/attachment`, formData);
      setSelectedTask((prev: any) => ({
        ...prev,
        attachments: [att, ...(prev.attachments || [])],
      }));
      setFileToUpload(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const canEditTask = (task: any) => {
    if (isManagerOrAdmin) return true;
    return task?.assigneeId === user?.id;
  };

  const currentBlockedByIDs = selectedTask?.dependencies?.map((d: any) => d.blockingTaskId) || [];
  const eligibleBlockers = tasks.filter(t => t.id !== selectedTask?.id && !currentBlockedByIDs.includes(t.id));

  // Calendar View Helpers
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const gridDays = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      gridDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      gridDays.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = gridDays.length % 7 === 0 ? 0 : 7 - (gridDays.length % 7);
    for (let d = 1; d <= remaining; d++) {
      gridDays.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return gridDays;
  };

  const calendarDays = getCalendarDays();

  const getTasksForDate = (date: Date) => {
    return tasks.filter((t: any) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return (
        due.getFullYear() === date.getFullYear() &&
        due.getMonth() === date.getMonth() &&
        due.getDate() === date.getDate()
      );
    });
  };

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
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-center max-w-md">
          <p className="font-semibold mb-2 text-sm">Error Loading Tasks</p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const columns = [
    { id: 'TODO', title: 'Todo', color: 'bg-slate-500/10 text-slate-700' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500/10 text-blue-700' },
    { id: 'REVIEW', title: 'In Review', color: 'bg-purple-500/10 text-purple-700' },
    { id: 'DONE', title: 'Completed', color: 'bg-emerald-500/10 text-emerald-700' },
  ];

  const getPriorityBadge = (pri: string) => {
    if (pri === 'HIGH') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    if (pri === 'MEDIUM') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.themeColor }} />
            <h2 className="text-2xl font-bold">{project.name}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage project workflow milestones</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl p-1 bg-slate-500/5 border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-600/25"
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Main Panel View */}
      {tasks.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border text-slate-500">
          <CheckSquare size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="font-semibold text-lg">No tasks assigned yet</p>
          <p className="text-sm">Click "Create Task" to populate your project schedule.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col max-h-[75vh]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{colTasks.length}</span>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleOpenDetails(task)}
                      className="glass-card p-4 rounded-xl border cursor-pointer hover:scale-[1.01] transition-transform space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock size={10} />
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs leading-normal">{task.title}</h4>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-500/5 text-[10px] text-slate-500">
                        <span className="truncate">Assignee: {task.assignee?.name || 'Unassigned'}</span>
                        {task.subTasks?.length > 0 && (
                          <span className="flex items-center gap-0.5 shrink-0">
                            <CheckSquare size={10} />
                            {task.subTasks.filter((s: any) => s.status === 'DONE').length}/{task.subTasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="glass-panel border rounded-2xl overflow-hidden divide-y divide-slate-200/40 dark:divide-slate-800/40">
          <div className="p-3 bg-slate-500/5 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-1/2">Task Title</div>
            <div className="w-1/6">Priority</div>
            <div className="w-1/6">Status</div>
            <div className="w-1/6">Assignee</div>
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleOpenDetails(task)}
              className="p-3.5 hover:bg-slate-500/3 flex items-center cursor-pointer transition-colors text-xs font-medium"
            >
              <div className="w-1/2 font-semibold text-slate-800 dark:text-slate-100 truncate pr-4">{task.title}</div>
              <div className="w-1/6">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="w-1/6">
                <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-semibold">{task.status}</span>
              </div>
              <div className="w-1/6 text-slate-500">{task.assignee?.name || 'Unassigned'}</div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          {/* Navigation Bar */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-500/10 cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-500/10 cursor-pointer font-semibold transition-colors text-slate-600 dark:text-slate-300"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-500/10 cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dateTasks = getTasksForDate(day.date);
              const isToday = new Date().toDateString() === day.date.toDateString();
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 glass-panel border rounded-xl flex flex-col gap-1 relative transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 ${
                    day.isCurrentMonth ? '' : 'opacity-35'
                  } ${
                    isToday ? 'border-indigo-500/60 ring-2 ring-indigo-500/10 bg-indigo-500/3' : 'border-slate-200/40 dark:border-slate-800/40'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-500' : 'text-slate-450 dark:text-slate-350'}`}>
                    {day.date.getDate()}
                  </span>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dateTasks.slice(0, 3).map((t: any) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(t);
                        }}
                        className="px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 truncate cursor-pointer transition-colors"
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dateTasks.length > 3 && (
                      <div className="text-[9px] text-slate-450 dark:text-slate-400 font-bold pl-1">
                        + {dateTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Details Dialog Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl glass-panel rounded-3xl border border-white/10 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityBadge(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
                <span className="text-xs font-semibold text-slate-400">Task details</span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold leading-tight">{selectedTask.title}</h3>
                  <p className="text-slate-500 dark:text-slate-450 leading-relaxed">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* Warnings Alert Panel */}
                {detailsWarning && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-2 items-start text-xs">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="leading-normal">{detailsWarning}</p>
                  </div>
                )}

                {/* Subtask Panel */}
                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckSquare size={16} />
                    Subtasks Checklist
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTask.subTasks?.map((sub: any) => (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubtask(sub.id, sub.status)}
                        className="p-2.5 rounded-xl border border-slate-500/10 hover:border-slate-500/20 bg-slate-500/3 flex items-center justify-between gap-3 cursor-pointer text-xs"
                      >
                        <span className={`flex-1 truncate ${sub.status === 'DONE' ? 'line-through text-slate-500' : 'font-medium'}`}>
                          {sub.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={sub.status === 'DONE'}
                          onChange={() => {}}
                          className="rounded text-indigo-600 pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a subtask..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Comments Panel */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-1.5 text-xs text-slate-400">
                    <MessageSquare size={16} />
                    Comments
                  </h4>

                  <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                    <textarea
                      required
                      rows={2}
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Add a comment... (use @email to mention team members)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="self-end px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Comment
                    </button>
                  </form>

                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {selectedTask.comments?.map((comment: any) => (
                      <div key={comment.id} className="p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex gap-3 text-xs leading-normal">
                        <div className="w-8 h-8 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-350 flex items-center justify-center font-bold shrink-0">
                          {comment.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{comment.user?.name}</p>
                          <p className="text-slate-550 dark:text-slate-400 mt-1">{comment.content}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar controls */}
              <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-slate-250/30 lg:pl-6 pt-5 lg:pt-0">
                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350">Status Selector</label>
                  <select
                    disabled={!canEditTask(selectedTask)}
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="TODO" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Todo</option>
                    <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">In Progress</option>
                    <option value="REVIEW" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">In Review</option>
                    <option value="DONE" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Completed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350">Assignee</label>
                  <div className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-500/3 flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs">{selectedTask.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350">Due Date</label>
                  <div className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-500/3 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No limit'}
                    </span>
                  </div>
                </div>

                {/* Blocking Dependencies panel */}
                <div className="space-y-3 pt-3 border-t border-slate-250/20">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Task Blockers
                  </label>

                  {/* List of current blockers */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {(!selectedTask.dependencies || selectedTask.dependencies.length === 0) ? (
                      <span className="text-[11px] text-slate-500 italic block">No blocking dependencies.</span>
                    ) : (
                      selectedTask.dependencies.map((dep: any) => (
                        <div key={dep.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-500/3 border border-slate-200/40 dark:border-slate-800/40 text-xs">
                          <span className="truncate pr-2 font-medium" title={dep.blockingTask?.title}>
                            {dep.blockingTask?.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              dep.blockingTask?.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {dep.blockingTask?.status}
                            </span>
                            {canEditTask(selectedTask) && (
                              <button
                                onClick={() => handleRemoveDependency(dep.blockingTaskId)}
                                className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer"
                                title="Remove blocker"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Blocker Select */}
                  {canEditTask(selectedTask) && eligibleBlockers.length > 0 && (
                    <div className="pt-1">
                      <select
                        onChange={(e) => {
                          handleAddDependency(e.target.value);
                          e.target.value = ""; // Reset select
                        }}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>+ Add blocking dependency...</option>
                        {eligibleBlockers.map((t: any) => (
                          <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Attachments panel */}
                <div className="space-y-3 pt-3 border-t border-slate-250/20">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Paperclip size={14} />
                    Files & Attachments
                  </label>

                  <form onSubmit={handleUploadFile} className="space-y-2">
                    <input
                      type="file"
                      required
                      onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-500/10 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-500/20 cursor-pointer"
                    />
                    {fileToUpload && (
                      <button
                        type="submit"
                        disabled={uploadingFile}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1"
                      >
                        {uploadingFile ? <Loader size={12} className="animate-spin" /> : 'Upload File'}
                      </button>
                    )}
                  </form>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTask.attachments?.map((att: any) => (
                      <div
                        key={att.id}
                        className="p-2 rounded-lg border border-slate-500/10 hover:border-slate-500/20 bg-slate-500/3 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate pr-1">{att.filename}</span>
                        </div>
                        <a
                          href={`http://localhost:3001/${att.path}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0 cursor-pointer"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/10 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-500/5">
              <h3 className="font-bold text-lg">Create Project Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Setup Prisma DB schema"
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task instructions and guidelines..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-slate-700/50 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Low</option>
                    <option value="MEDIUM" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Medium</option>
                    <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-350">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {member.name} ({member.role?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Parent Task (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">None</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Task Dependencies (Optional Blocking Tasks)</label>
                <div className="border border-slate-200/55 dark:border-slate-700/50 rounded-xl p-2 max-h-32 overflow-y-auto space-y-1 bg-slate-500/3">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2 text-center">No other tasks to block this task.</p>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedDependencyIds((prev) =>
                            prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id],
                          );
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer flex justify-between items-center text-xs transition-colors ${
                          selectedDependencyIds.includes(t.id)
                            ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'hover:bg-slate-500/5 text-slate-650 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-1">{t.title}</span>
                        <input
                          type="checkbox"
                          checked={selectedDependencyIds.includes(t.id)}
                          onChange={() => {}}
                          className="rounded pointer-events-none text-indigo-600"
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
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  {createLoading ? <Loader size={16} className="animate-spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
