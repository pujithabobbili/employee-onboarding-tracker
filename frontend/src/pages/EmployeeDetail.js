import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const employeeId = parseInt(id);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', employee_id: employeeId,
    status: 'pending', priority: 'medium', due_date: '',
  });

  useEffect(() => {
    loadTasks();
  }, [employeeId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTasks(employeeId);
      setTasks(data);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await apiClient.updateTask(editingTask.id, formData);
        setEditingTask(null);
      } else {
        await apiClient.createTask(formData);
      }
      setShowAddForm(false);
      resetForm();
      loadTasks();
    } catch (err) { alert('Error saving task: ' + err.message); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', employee_id: employeeId, status: 'pending', priority: 'medium', due_date: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '', employee_id: task.employee_id, status: task.status, priority: task.priority, due_date: task.due_date || '' });
    setShowAddForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try { await apiClient.deleteTask(taskId); loadTasks(); }
      catch (err) { alert('Error deleting task: ' + err.message); }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-l-emerald-500', icon: 'text-emerald-500' };
      case 'in-progress': return { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500', icon: 'text-blue-500' };
      default: return { badge: 'bg-gray-50 text-gray-600 border-gray-200', border: 'border-l-gray-300', icon: 'text-gray-400' };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-64 mb-2"></div>
        <div className="h-5 skeleton w-96 mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton"></div>)}
        </div>
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
        <button onClick={loadTasks} className="btn btn-primary btn-sm">Try Again</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/employees" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="page-title">Employee Tasks</h1>
            <p className="page-subtitle">Manage onboarding tasks for employee #{employeeId}</p>
          </div>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); if(editingTask) { setEditingTask(null); resetForm(); } }} className="btn btn-primary flex items-center space-x-2">
          <svg className={`h-5 w-5 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showAddForm ? 'Close' : 'Add Task'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-xl">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Overall Progress</span>
                <span className="text-sm text-gray-500 ml-2">{completedCount} of {tasks.length} tasks completed</span>
              </div>
            </div>
            <span className={`text-lg font-extrabold ${progressPct === 100 ? 'text-emerald-600' : 'text-primary-600'}`}>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${progressPct === 100 ? 'from-emerald-400 to-emerald-500' : 'from-primary-400 to-violet-500'}`} style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      )}

      {/* Form */}
      {(showAddForm || editingTask) && (
        <div className="form-card mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-xl">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingTask ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <p className="text-sm text-gray-500">{editingTask ? 'Update the task details' : 'Create a new onboarding task'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input" placeholder="Task title" required />
              </div>
              <div>
                <label className="label">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className="select" required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="select" required>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="input" rows={3} placeholder="Describe the task..." />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="btn btn-primary">{editingTask ? 'Update Task' : 'Add Task'}</button>
              <button type="button" onClick={() => { setShowAddForm(false); setEditingTask(null); resetForm(); }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task, i) => {
          const statusStyle = getStatusStyle(task.status);
          return (
            <div
              key={task.id}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 border-l-4 ${statusStyle.border} p-5 hover:shadow-card-hover transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
                    <span className={`status-badge ${statusStyle.badge}`}>{task.status}</span>
                    <span className={`status-badge ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {task.due_date && (
                      <div className="flex items-center">
                        <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => handleEdit(task)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-violet-100 rounded-3xl flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks yet</h3>
          <p className="text-gray-500 mb-5">Create the first onboarding task for this employee</p>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">Add First Task</button>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
