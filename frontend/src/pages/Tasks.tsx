import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Task, Employee } from '../types';
import { Plus, Calendar, Flag, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

const Tasks: React.FC = () => {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.getEmployees(),
  });

  const { data: allTasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      if (!employees) return [];
      const tasksPromises = employees.map(emp => apiClient.getTasks(emp.id!));
      const tasksArrays = await Promise.all(tasksPromises);
      return tasksArrays.flat();
    },
    enabled: !!employees,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-danger-600 mb-2">Error loading tasks</div>
        <div className="text-gray-500">Please try again later</div>
      </div>
    );
  }

  // Group tasks by employee
  const tasksByEmployee = allTasks?.reduce((acc, task) => {
    const employee = employees?.find(emp => emp.id === task.employee_id);
    if (employee) {
      if (!acc[employee.id!]) {
        acc[employee.id!] = { employee, tasks: [] };
      }
      acc[employee.id!].tasks.push(task);
    }
    return acc;
  }, {} as Record<number, { employee: Employee; tasks: Task[]>>) || {};

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-2">Overview of all onboarding tasks</p>
        </div>
        <Link to="/employees" className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Manage Tasks
        </Link>
      </div>

      {/* Task Statistics */}
      {allTasks && allTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{allTasks.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">
                {allTasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600">
                {allTasks.filter(t => t.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-danger-600">
                {allTasks.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks by Employee */}
      <div className="space-y-8">
        {Object.values(tasksByEmployee).map(({ employee, tasks }) => (
          <div key={employee.id} className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                  <div className="text-sm text-gray-500">{employee.department}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {tasks.filter(t => t.status === 'completed').length} / {tasks.length} completed
                </div>
                <Link
                  to={`/employees/${employee.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  View All
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`status-badge ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {task.due_date && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(task.created_at!), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    to={`/employees/${employee.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View {tasks.length - 3} more tasks
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(tasksByEmployee).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No tasks found</div>
          <Link to="/employees" className="btn btn-primary">
            Add employees and tasks to get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Tasks;
