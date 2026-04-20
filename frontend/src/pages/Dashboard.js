import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 skeleton w-64 mb-2"></div>
        <div className="h-5 skeleton w-96 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 skeleton"></div>
          ))}
        </div>
        <div className="h-96 skeleton mt-6"></div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Error loading dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={loadDashboard} className="btn btn-primary btn-sm">Try Again</button>
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = stats.tasks.total_tasks > 0 
    ? Math.round((stats.tasks.completed_tasks / stats.tasks.total_tasks) * 100)
    : 0;

  const avgProgress = stats.employeeProgress.length > 0
    ? Math.round(stats.employeeProgress.reduce((acc, emp) => acc + emp.completion_percentage, 0) / stats.employeeProgress.length)
    : 0;

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.employees.total_employees,
      subtitle: `${stats.employees.admin_count} admins, ${stats.employees.employee_count} employees`,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Total Tasks',
      value: stats.tasks.total_tasks,
      subtitle: `${stats.tasks.pending_tasks} pending, ${stats.tasks.in_progress_tasks} in progress`,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: `${stats.tasks.completed_tasks} of ${stats.tasks.total_tasks} completed`,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Avg Progress',
      value: `${avgProgress}%`,
      subtitle: 'Across all employees',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  const getProgressColor = (pct) => {
    if (pct === 100) return 'from-emerald-400 to-emerald-500';
    if (pct >= 50) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-red-500';
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
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Welcome back, <span className="gradient-text">{user.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="page-subtitle">Here's what's happening with your team's onboarding</p>
          </div>
          <Link to="/employees" className="btn btn-primary flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Employee</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div
            key={card.title}
            className={`stat-card bg-gradient-to-br ${card.gradient} animate-fade-in-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                  {card.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
              <p className="text-sm text-white/60 mt-1">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Progress Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Progress</h2>
              <p className="text-sm text-gray-500 mt-0.5">{stats.employeeProgress.length} team members</p>
            </div>
            <Link to="/employees" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1 transition-colors">
              <span>View all</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.employeeProgress.map((employee, i) => (
                <tr key={employee.id} className="table-row group" style={{ animationDelay: `${500 + i * 50}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/employees/${employee.id}`} className="flex items-center group/link">
                      <div className={`avatar avatar-md bg-gradient-to-br ${getAvatarColor(employee.name)} text-white shadow-sm`}>
                        {employee.name.charAt(0)}
                      </div>
                      <div className="ml-3.5">
                        <div className="text-sm font-semibold text-gray-900 group-hover/link:text-primary-600 transition-colors">{employee.name}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{employee.completed_tasks}</span>
                      <span className="text-gray-400"> / {employee.total_tasks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 max-w-[140px]">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(employee.completion_percentage)} transition-all duration-700 ease-out`}
                            style={{ width: `${employee.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${
                        employee.completion_percentage === 100 ? 'text-emerald-600' :
                        employee.completion_percentage >= 50 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {employee.completion_percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stats.employeeProgress.length === 0 && (
          <div className="empty-state py-12">
            <p className="text-gray-500">No employee progress data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
