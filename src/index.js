import { Router } from 'itty-router';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role',
  'Access-Control-Max-Age': '86400',
};

// Utility functions
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role',
      'Access-Control-Max-Age': '86400',
    },
  });
};

const handleCORS = () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Role-based access control
const checkRole = (request, requiredRole) => {
  if (requiredRole === 'any') return true;
  
  const userRole = request.headers.get('X-User-Role');
  if (!userRole) return false;
  
  if (requiredRole === 'admin') return userRole === 'admin';
  if (requiredRole === 'employee') return userRole === 'employee' || userRole === 'admin';
  
  return false;
};

// Validation functions
const validateEmployee = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.role || !['admin', 'employee'].includes(data.role)) {
    errors.push('Role must be either admin or employee');
  }
  
  if (!data.department || data.department.trim().length < 2) {
    errors.push('Department must be at least 2 characters long');
  }
  
  return errors;
};

const validateTask = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!data.employee_id || typeof data.employee_id !== 'number') {
    errors.push('Valid employee ID is required');
  }
  
  if (!data.status || !['pending', 'in-progress', 'completed'].includes(data.status)) {
    errors.push('Status must be pending, in-progress, or completed');
  }
  
  if (!data.priority || !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority must be low, medium, or high');
  }
  
  return errors;
};

// Initialize router
const router = Router();

// Middleware for CORS
router.options('*', handleCORS);

// Employee endpoints
router.post('/employees', async (request, env) => {
  if (!checkRole(request, 'admin')) {
    return jsonResponse({ success: false, error: 'Admin access required' }, 403);
  }

  try {
    const data = await request.json();
    const errors = validateEmployee(data);
    
    if (errors.length > 0) {
      return jsonResponse({ success: false, error: errors.join(', ') }, 400);
    }

    const stmt = env.DB.prepare(`
      INSERT INTO employees (name, email, role, department)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = await stmt.bind(data.name, data.email, data.role, data.department).run();
    
    if (result.success) {
      const employee = await env.DB.prepare('SELECT * FROM employees WHERE id = ?')
        .bind(result.meta.last_row_id)
        .first();
      
      return jsonResponse({ success: true, data: employee });
    } else {
      return jsonResponse({ success: false, error: 'Failed to create employee' }, 500);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

router.get('/employees', async (request, env) => {
  if (!checkRole(request, 'employee')) {
    return jsonResponse({ success: false, error: 'Access denied' }, 403);
  }

  try {
    const employees = await env.DB.prepare('SELECT * FROM employees ORDER BY created_at DESC').all();
    return jsonResponse({ success: true, data: employees.results });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

// Task endpoints
router.post('/tasks', async (request, env) => {
  if (!checkRole(request, 'admin')) {
    return jsonResponse({ success: false, error: 'Admin access required' }, 403);
  }

  try {
    const data = await request.json();
    const errors = validateTask(data);
    
    if (errors.length > 0) {
      return jsonResponse({ success: false, error: errors.join(', ') }, 400);
    }

    // Verify employee exists
    const employee = await env.DB.prepare('SELECT id FROM employees WHERE id = ?')
      .bind(data.employee_id)
      .first();
    
    if (!employee) {
      return jsonResponse({ success: false, error: 'Employee not found' }, 404);
    }

    const stmt = env.DB.prepare(`
      INSERT INTO tasks (title, description, employee_id, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = await stmt.bind(
      data.title,
      data.description || '',
      data.employee_id,
      data.status,
      data.priority,
      data.due_date || null
    ).run();
    
    if (result.success) {
      const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?')
        .bind(result.meta.last_row_id)
        .first();
      
      return jsonResponse({ success: true, data: task });
    } else {
      return jsonResponse({ success: false, error: 'Failed to create task' }, 500);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

router.get('/tasks/:employeeId', async (request, env, ctx) => {
  if (!checkRole(request, 'employee')) {
    return jsonResponse({ success: false, error: 'Access denied' }, 403);
  }

  const { employeeId } = request.params;
  
  try {
    const tasks = await env.DB.prepare(`
      SELECT * FROM tasks 
      WHERE employee_id = ? 
      ORDER BY priority DESC, due_date ASC, created_at DESC
    `).bind(employeeId).all();
    
    return jsonResponse({ success: true, data: tasks.results });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

router.patch('/tasks/:id', async (request, env, ctx) => {
  if (!checkRole(request, 'admin')) {
    return jsonResponse({ success: false, error: 'Admin access required' }, 403);
  }

  const { id } = request.params;
  
  try {
    const data = await request.json();
    
    // Only allow updating specific fields
    const allowedFields = ['status', 'title', 'description', 'priority', 'due_date'];
    const updates = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    
    if (updates.length === 0) {
      return jsonResponse({ success: false, error: 'No valid fields to update' }, 400);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = env.DB.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    const result = await stmt.bind(...values).run();
    
    if (result.success && result.changes > 0) {
      const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
      return jsonResponse({ success: true, data: task });
    } else {
      return jsonResponse({ success: false, error: 'Task not found or no changes made' }, 404);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

router.delete('/tasks/:id', async (request, env, ctx) => {
  if (!checkRole(request, 'admin')) {
    return jsonResponse({ success: false, error: 'Admin access required' }, 403);
  }

  const { id } = request.params;
  
  try {
    const stmt = env.DB.prepare('DELETE FROM tasks WHERE id = ?');
    const result = await stmt.bind(id).run();
    
    if (result.success && result.changes > 0) {
      return jsonResponse({ success: true, message: 'Task deleted successfully' });
    } else {
      return jsonResponse({ success: false, error: 'Task not found' }, 404);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

// Dashboard endpoint - get overview stats
router.get('/dashboard', async (request, env) => {
  if (!checkRole(request, 'employee')) {
    return jsonResponse({ success: false, error: 'Access denied' }, 403);
  }

  try {
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'employee' THEN 1 END) as employee_count
      FROM employees
    `).first();

    const taskStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
      FROM tasks
    `).first();

    const employeeProgress = await env.DB.prepare(`
      SELECT 
        e.id,
        e.name,
        e.department,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        ROUND(
          CASE 
            WHEN COUNT(t.id) = 0 THEN 0 
            ELSE (COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / COUNT(t.id))
          END, 2
        ) as completion_percentage
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      GROUP BY e.id, e.name, e.department
      ORDER BY completion_percentage DESC
    `).all();

    return jsonResponse({
      success: true,
      data: {
        employees: stats,
        tasks: taskStats,
        employeeProgress: employeeProgress.results
      }
    });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
});

// 404 handler
router.all('*', () => jsonResponse({ success: false, error: 'Not found' }, 404));

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};
