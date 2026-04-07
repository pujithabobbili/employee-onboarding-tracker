const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:52294';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.userRole = localStorage.getItem('userRole') || 'employee';
  }

  setUserRole(role) {
    this.userRole = role;
    localStorage.setItem('userRole', role);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Role': this.userRole,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getEmployees() {
    return this.request('/employees');
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async getTasks(employeeId) {
    return this.request(`/tasks/${employeeId}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    return this.request('/dashboard');
  }
}

export const apiClient = new ApiClient();
