import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '../services/api';
import { getTemplatesForDepartment, calculateDueDate } from '../data/taskTemplates';
import { notificationService } from '../services/notifications';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [autoCreateTasks, setAutoCreateTasks] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newEmployee = await apiClient.createEmployee(formData);
      toast.success(`${formData.name} added successfully!`);
      
      // Send welcome email
      await notificationService.sendWelcomeEmail(newEmployee);
      
      // Auto-create tasks from templates if enabled
      if (autoCreateTasks && formData.department) {
        const templates = getTemplatesForDepartment(formData.department);
        if (templates.length > 0) {
          let tasksCreated = 0;
          for (const template of templates) {
            try {
              await apiClient.createTask({
                ...template,
                employee_id: newEmployee.id,
                due_date: calculateDueDate(template.daysFromStart),
                status: 'pending',
              });
              tasksCreated++;
            } catch (taskErr) {
              console.error('Error creating task:', taskErr);
            }
          }
          if (tasksCreated > 0) {
            toast.success(`${tasksCreated} onboarding tasks created automatically!`);
          }
        }
      }
      
      setShowAddForm(false);
      setFormData({ name: '', email: '', role: 'employee', department: '' });
      loadEmployees();
    } catch (err) {
      toast.error('Error creating employee: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-400 to-indigo-500',
      'from-violet-400 to-purple-500',
      'from-pink-400 to-rose-500',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-cyan-400 to-blue-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-10 skeleton w-48 mb-2"></div>
            <div className="h-5 skeleton w-64"></div>
          </div>
          <div className="h-11 skeleton w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 skeleton"></div>
          ))}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Error loading employees</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={loadEmployees} className="btn btn-primary btn-sm">Try Again</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your team of {employees.length} members</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <svg className={`h-5 w-5 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showAddForm ? 'Close' : 'Add Employee'}</span>
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="form-card mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-xl">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Employee</h2>
              <p className="text-sm text-gray-500">Fill in the details to add a team member</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input" placeholder="John Doe" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input" placeholder="john@company.com" required />
              </div>
              <div>
                <label className="label">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="select" required>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="input" placeholder="Engineering" required />
              </div>
            </div>
            
            {/* Auto-create tasks toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50/50 to-violet-50/50 rounded-xl border border-primary-100/40">
              <div className="relative">
                <input
                  type="checkbox" id="autoCreateTasks" checked={autoCreateTasks}
                  onChange={(e) => setAutoCreateTasks(e.target.checked)}
                  className="sr-only peer"
                />
                <label htmlFor="autoCreateTasks" className="block w-11 h-6 bg-gray-200 peer-checked:bg-primary-500 rounded-full cursor-pointer transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-300 peer-checked:after:translate-x-5 after:shadow-sm"></label>
              </div>
              <label htmlFor="autoCreateTasks" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-semibold">Auto-create onboarding tasks</span>
                {formData.department && (
                  <span className="text-primary-600 ml-1">({getTemplatesForDepartment(formData.department).length} tasks for {formData.department})</span>
                )}
              </label>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="btn btn-primary">
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Employee</span>
                </span>
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }}} />

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((employee, i) => (
          <div
            key={employee.id}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`avatar avatar-lg bg-gradient-to-br ${getAvatarColor(employee.name)} text-white shadow-md group-hover:scale-110 group-hover:shadow-lg`}>
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3.5">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{employee.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-0.5">
                    <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate max-w-[160px]">{employee.email}</span>
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                employee.role === 'admin'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                {employee.role}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-5">
              <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {employee.department}
            </div>

            <Link
              to={`/employees/${employee.id}`}
              className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-700 rounded-xl border border-gray-100 hover:border-primary-200 transition-all duration-200 text-sm font-medium group/btn"
            >
              <span>View Tasks</span>
              <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="empty-state">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-violet-100 rounded-3xl flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No employees yet</h3>
          <p className="text-gray-500 mb-5">Get started by adding your first team member</p>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            Add Your First Employee
          </button>
        </div>
      )}
    </div>
  );
};

export default Employees;
