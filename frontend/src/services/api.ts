import { ApiResponse, Employee, Task, DashboardStats, TaskFormData, EmployeeFormData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';

class ApiClient {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'X-User-Role': this.getUserRole(),
    };
  }

  private getUserRole(): string {
    return localStorage.getItem('userRole') || 'employee';
  }

  setUserRole(role: 'admin' | 'employee') {
    localStorage.setItem('userRole', role);
    this.headers['X-User-Role'] = role;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  // Employee endpoints
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: this.headers,
    });
    const result = await this.handleResponse<Employee[]>(response);
    return result.data || [];
  }

  async createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(employeeData),
    });
    const result = await this.handleResponse<Employee>(response);
    if (!result.data) {
      throw new Error('Failed to create employee');
    }
    return result.data;
  }

  // Task endpoints
  async getTasks(employeeId: number): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/${employeeId}`, {
      headers: this.headers,
    });
    const result = await this.handleResponse<Task[]>(response);
    return result.data || [];
  }

  async createTask(taskData: TaskFormData): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(taskData),
    });
    const result = await this.handleResponse<Task>(response);
    if (!result.data) {
      throw new Error('Failed to create task');
    }
    return result.data;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(updates),
    });
    const result = await this.handleResponse<Task>(response);
    if (!result.data) {
      throw new Error('Failed to update task');
    }
    return result.data;
  }

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    await this.handleResponse<void>(response);
  }

  // Dashboard endpoint
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: this.headers,
    });
    const result = await this.handleResponse<DashboardStats>(response);
    if (!result.data) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return result.data;
  }
}

export const apiClient = new ApiClient();
