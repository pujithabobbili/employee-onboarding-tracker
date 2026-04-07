export interface Employee {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  employee_id: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  employees: {
    total_employees: number;
    admin_count: number;
    employee_count: number;
  };
  tasks: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
  };
  employeeProgress: Array<{
    id: number;
    name: string;
    department: string;
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
  }>;
}

export type UserRole = 'admin' | 'employee';

export interface TaskFormData {
  title: string;
  description: string;
  employee_id: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
}
