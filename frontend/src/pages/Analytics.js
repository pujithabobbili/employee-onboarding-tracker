import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardData, employeesData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getEmployees(),
      ]);
      setStats(dashboardData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare data for charts
  const taskStatusData = [
    { name: 'Completed', value: stats.tasks.completed_tasks, color: '#10b981' },
    { name: 'In Progress', value: stats.tasks.in_progress_tasks, color: '#f59e0b' },
    { name: 'Pending', value: stats.tasks.pending_tasks, color: '#ef4444' },
  ];

  const departmentData = employees.reduce((acc, emp) => {
    const existing = acc.find(d => d.department === emp.department);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ department: emp.department, count: 1 });
    }
    return acc;
  }, []);

  const progressData = stats.employeeProgress.map(emp => ({
    name: emp.name.split(' ')[0], // First name only
    progress: emp.completion_percentage,
    tasks: emp.total_tasks,
  }));

  const roleData = [
    { name: 'Admins', value: stats.employees.admin_count, color: '#3b82f6' },
    { name: 'Employees', value: stats.employees.employee_count, color: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Insights and metrics for onboarding performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-sm opacity-90">Total Employees</div>
          <div className="text-4xl font-bold mt-2">{stats.employees.total_employees}</div>
          <div className="text-sm mt-2 opacity-75">
            {stats.employees.admin_count} admins, {stats.employees.employee_count} employees
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-sm opacity-90">Completion Rate</div>
          <div className="text-4xl font-bold mt-2">
            {stats.tasks.total_tasks > 0 
              ? Math.round((stats.tasks.completed_tasks / stats.tasks.total_tasks) * 100)
              : 0}%
          </div>
          <div className="text-sm mt-2 opacity-75">
            {stats.tasks.completed_tasks} of {stats.tasks.total_tasks} tasks
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-sm opacity-90">Avg Progress</div>
          <div className="text-4xl font-bold mt-2">
            {stats.employeeProgress.length > 0
              ? Math.round(
                  stats.employeeProgress.reduce((acc, emp) => acc + emp.completion_percentage, 0) /
                  stats.employeeProgress.length
                )
              : 0}%
          </div>
          <div className="text-sm mt-2 opacity-75">Across all employees</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-sm opacity-90">Active Tasks</div>
          <div className="text-4xl font-bold mt-2">
            {stats.tasks.in_progress_tasks + stats.tasks.pending_tasks}
          </div>
          <div className="text-sm mt-2 opacity-75">
            {stats.tasks.in_progress_tasks} in progress, {stats.tasks.pending_tasks} pending
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#3b82f6" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Top Performer</h4>
          <p className="text-blue-700">
            {stats.employeeProgress.length > 0 && stats.employeeProgress[0].name} leads with{' '}
            {stats.employeeProgress.length > 0 && stats.employeeProgress[0].completion_percentage}% completion
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Needs Attention</h4>
          <p className="text-yellow-700">
            {stats.tasks.pending_tasks} tasks are still pending and need to be started
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">✅ Success Rate</h4>
          <p className="text-green-700">
            {stats.tasks.total_tasks > 0 
              ? Math.round((stats.tasks.completed_tasks / stats.tasks.total_tasks) * 100)
              : 0}% of all tasks have been completed successfully
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
