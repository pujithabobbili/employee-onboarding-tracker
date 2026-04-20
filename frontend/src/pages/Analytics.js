import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-glass border border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{label || payload[0].name}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm text-gray-600">{p.name}: <span className="font-bold" style={{ color: p.color }}>{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardData, employeesData] = await Promise.all([apiClient.getDashboardStats(), apiClient.getEmployees()]);
      setStats(dashboardData);
      setEmployees(employeesData);
    } catch (err) { console.error('Error loading analytics:', err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-64 mb-2"></div>
        <div className="h-5 skeleton w-96 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-80 skeleton"></div>)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = stats.tasks.total_tasks > 0 ? Math.round((stats.tasks.completed_tasks / stats.tasks.total_tasks) * 100) : 0;
  const avgProgress = stats.employeeProgress.length > 0 ? Math.round(stats.employeeProgress.reduce((acc, emp) => acc + emp.completion_percentage, 0) / stats.employeeProgress.length) : 0;

  const taskStatusData = [
    { name: 'Completed', value: stats.tasks.completed_tasks, color: '#10b981' },
    { name: 'In Progress', value: stats.tasks.in_progress_tasks, color: '#6366f1' },
    { name: 'Pending', value: stats.tasks.pending_tasks, color: '#f59e0b' },
  ];

  const departmentData = employees.reduce((acc, emp) => {
    const existing = acc.find(d => d.department === emp.department);
    if (existing) existing.count++;
    else acc.push({ department: emp.department, count: 1 });
    return acc;
  }, []);

  const progressData = stats.employeeProgress.map(emp => ({
    name: emp.name.split(' ')[0],
    progress: emp.completion_percentage,
    tasks: emp.total_tasks,
  }));

  const roleData = [
    { name: 'Admins', value: stats.employees.admin_count, color: '#6366f1' },
    { name: 'Employees', value: stats.employees.employee_count, color: '#a78bfa' },
  ];

  const metricCards = [
    { title: 'Total Employees', value: stats.employees.total_employees, sub: `${stats.employees.admin_count} admins, ${stats.employees.employee_count} employees`, gradient: 'from-blue-500 via-blue-600 to-indigo-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { title: 'Completion Rate', value: `${completionRate}%`, sub: `${stats.tasks.completed_tasks} of ${stats.tasks.total_tasks} tasks`, gradient: 'from-emerald-500 via-green-500 to-teal-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Avg Progress', value: `${avgProgress}%`, sub: 'Across all employees', gradient: 'from-amber-500 via-orange-500 to-red-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { title: 'Active Tasks', value: stats.tasks.in_progress_tasks + stats.tasks.pending_tasks, sub: `${stats.tasks.in_progress_tasks} in progress, ${stats.tasks.pending_tasks} pending`, gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const renderPieLabel = ({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">{`${(percent * 100).toFixed(0)}%`}</text>
    ) : null;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics <span className="gradient-text">Dashboard</span></h1>
        <p className="page-subtitle">Insights and metrics for onboarding performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map((c, i) => (
          <div key={c.title} className={`stat-card bg-gradient-to-br ${c.gradient} animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white/80">{c.title}</p>
                <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} /></svg>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{c.value}</p>
              <p className="text-sm text-white/60 mt-1">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Pie */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Task Status Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Breakdown of task completion states</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={110} innerRadius={55} fill="#8884d8" dataKey="value" strokeWidth={3} stroke="#fff">
                {taskStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Employee Progress</h3>
          <p className="text-sm text-gray-500 mb-4">Completion percentage per employee</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={progressData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="progress" name="Completion %" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Employees by Department</h3>
          <p className="text-sm text-gray-500 mb-4">Team distribution across departments</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Employees" radius={[8, 8, 0, 0]} fill="url(#deptGradient)" />
              <defs>
                <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Donut */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Role Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Admin vs Employee ratio</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={110} innerRadius={55} fill="#8884d8" dataKey="value" strokeWidth={3} stroke="#fff">
                {roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">Top Performer</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {stats.employeeProgress.length > 0 ? (
              <><span className="font-semibold text-gray-900">{stats.employeeProgress[0].name}</span> leads with <span className="font-bold text-primary-600">{stats.employeeProgress[0].completion_percentage}%</span> completion</>
            ) : 'No data yet'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">Needs Attention</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-amber-600">{stats.tasks.pending_tasks} tasks</span> are still pending and need to be started
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/60 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">Success Rate</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-emerald-600">{completionRate}%</span> of all tasks have been completed successfully
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
