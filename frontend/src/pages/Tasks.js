import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';

const Tasks = () => {
  const [employees, setEmployees] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeesData = await apiClient.getEmployees();
      setEmployees(employeesData);
      const tasksArrays = await Promise.all(employeesData.map(emp => apiClient.getTasks(emp.id).catch(() => [])));
      setAllTasks(tasksArrays.flat());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-l-emerald-500' };
      case 'in-progress': return { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' };
      default: return { badge: 'bg-gray-50 text-gray-600 border-gray-200', border: 'border-l-gray-300' };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['from-blue-400 to-indigo-500', 'from-violet-400 to-purple-500', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500', 'from-cyan-400 to-blue-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-48 mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton"></div>)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 skeleton"></div>)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Error loading tasks</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={loadData} className="btn btn-primary btn-sm">Try Again</button>
      </div>
    );
  }

  const tasksByEmployee = {};
  allTasks.forEach(task => {
    const employee = employees.find(emp => emp.id === task.employee_id);
    if (employee) {
      if (!tasksByEmployee[employee.id]) tasksByEmployee[employee.id] = { employee, tasks: [] };
      tasksByEmployee[employee.id].tasks.push(task);
    }
  });

  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const inProgressCount = allTasks.filter(t => t.status === 'in-progress').length;
  const pendingCount = allTasks.filter(t => t.status === 'pending').length;

  const miniStats = [
    { label: 'Total', value: allTasks.length, gradient: 'from-slate-600 to-slate-700', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Completed', value: completedCount, gradient: 'from-emerald-500 to-teal-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'In Progress', value: inProgressCount, gradient: 'from-blue-500 to-indigo-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Pending', value: pendingCount, gradient: 'from-amber-500 to-orange-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">Overview of all onboarding tasks across your team</p>
        </div>
        <Link to="/employees" className="btn btn-primary flex items-center space-x-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Manage Tasks</span>
        </Link>
      </div>

      {/* Mini Stats */}
      {allTasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {miniStats.map((s, i) => (
            <div key={s.label} className={`stat-card bg-gradient-to-br ${s.gradient} animate-fade-in-up`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-sm text-white/70">{s.label}</p>
                </div>
                <div className="p-2 bg-white/15 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks grouped by employee */}
      <div className="space-y-6">
        {Object.values(tasksByEmployee).map(({ employee, tasks }, groupIdx) => {
          const groupCompleted = tasks.filter(t => t.status === 'completed').length;
          const groupPct = Math.round((groupCompleted / tasks.length) * 100);
          return (
            <div key={employee.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 overflow-hidden animate-fade-in-up" style={{ animationDelay: `${300 + groupIdx * 100}ms` }}>
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`avatar avatar-lg bg-gradient-to-br ${getAvatarColor(employee.name)} text-white shadow-sm`}>
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-900">{groupPct}%</div>
                      <div className="text-xs text-gray-500">{groupCompleted}/{tasks.length} done</div>
                    </div>
                    <Link to={`/employees/${employee.id}`} className="btn btn-secondary btn-sm flex items-center space-x-1.5">
                      <span>View All</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className={`h-1.5 rounded-full bg-gradient-to-r ${groupPct === 100 ? 'from-emerald-400 to-emerald-500' : 'from-primary-400 to-violet-500'} transition-all duration-700`} style={{ width: `${groupPct}%` }}></div>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {tasks.slice(0, 3).map((task) => {
                  const statusStyle = getStatusStyle(task.status);
                  return (
                    <div key={task.id} className={`px-6 py-4 border-l-4 ${statusStyle.border} hover:bg-gray-50/50 transition-colors`}>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                        <span className={`status-badge ${statusStyle.badge}`}>{task.status}</span>
                        <span className={`status-badge ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mb-1.5">{task.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {task.due_date && (
                          <span className="flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {tasks.length > 3 && (
                <div className="px-6 py-3 bg-gray-50/50 text-center">
                  <Link to={`/employees/${employee.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    View {tasks.length - 3} more tasks
                    <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(tasksByEmployee).length === 0 && (
        <div className="empty-state">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-violet-100 rounded-3xl flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks found</h3>
          <p className="text-gray-500 mb-5">Add employees and tasks to get started</p>
          <Link to="/employees" className="btn btn-primary">Get Started</Link>
        </div>
      )}
    </div>
  );
};

export default Tasks;
