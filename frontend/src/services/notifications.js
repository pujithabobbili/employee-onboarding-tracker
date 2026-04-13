import toast from 'react-hot-toast';

// Simulated email notification service
// In production, this would call a backend API that sends real emails

export const notificationService = {
  // Send welcome email to new employee
  sendWelcomeEmail: async (employee) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`📧 Welcome Email Sent to ${employee.name} (${employee.email})`);
    console.log(`Subject: Welcome to the Team!`);
    console.log(`Body: Hi ${employee.name}, welcome to ${employee.department}!`);
    
    toast.success(`Welcome email sent to ${employee.name}`, {
      icon: '📧',
      duration: 3000,
    });
    
    return { success: true };
  },

  // Send task assignment notification
  sendTaskAssignedEmail: async (employee, task) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`📧 Task Assignment Email Sent to ${employee.name}`);
    console.log(`Subject: New Task Assigned: ${task.title}`);
    console.log(`Due Date: ${task.due_date}`);
    
    toast.success(`Task notification sent to ${employee.name}`, {
      icon: '📋',
      duration: 2000,
    });
    
    return { success: true };
  },

  // Send task due reminder
  sendTaskDueReminder: async (employee, task) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`📧 Task Reminder Email Sent to ${employee.name}`);
    console.log(`Subject: Reminder: ${task.title} is due soon`);
    
    toast(`Reminder sent to ${employee.name}`, {
      icon: '⏰',
      duration: 2000,
    });
    
    return { success: true };
  },

  // Send task completion notification to manager
  sendTaskCompletedEmail: async (employee, task, manager) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`📧 Task Completion Email Sent to ${manager || 'Manager'}`);
    console.log(`Subject: ${employee.name} completed: ${task.title}`);
    
    toast.success(`Manager notified of task completion`, {
      icon: '✅',
      duration: 2000,
    });
    
    return { success: true };
  },

  // Send onboarding progress report
  sendProgressReport: async (employee, progress) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`📧 Progress Report Email Sent to ${employee.name}`);
    console.log(`Subject: Your Onboarding Progress - ${progress}% Complete`);
    
    toast(`Progress report sent to ${employee.name}`, {
      icon: '📊',
      duration: 2000,
    });
    
    return { success: true };
  },

  // Batch send notifications
  sendBulkNotifications: async (employees, message) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Bulk Email Sent to ${employees.length} employees`);
    console.log(`Message: ${message}`);
    
    toast.success(`Notifications sent to ${employees.length} employees`, {
      icon: '📨',
      duration: 3000,
    });
    
    return { success: true, count: employees.length };
  },
};

// Email templates (for demonstration)
export const emailTemplates = {
  welcome: (employee) => ({
    subject: `Welcome to ${employee.department}!`,
    body: `
      Hi ${employee.name},
      
      Welcome to the team! We're excited to have you join us in the ${employee.department} department.
      
      Your onboarding tasks have been assigned. Please check your dashboard to get started.
      
      If you have any questions, don't hesitate to reach out!
      
      Best regards,
      HR Team
    `,
  }),

  taskAssigned: (employee, task) => ({
    subject: `New Task Assigned: ${task.title}`,
    body: `
      Hi ${employee.name},
      
      A new task has been assigned to you:
      
      Task: ${task.title}
      Priority: ${task.priority}
      Due Date: ${task.due_date}
      
      ${task.description ? `Description: ${task.description}` : ''}
      
      Please complete this task by the due date.
      
      Best regards,
      HR Team
    `,
  }),

  taskReminder: (employee, task, daysUntilDue) => ({
    subject: `Reminder: ${task.title} is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} days`}`,
    body: `
      Hi ${employee.name},
      
      This is a friendly reminder that the following task is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} days`}:
      
      Task: ${task.title}
      Due Date: ${task.due_date}
      Status: ${task.status}
      
      Please make sure to complete it on time.
      
      Best regards,
      HR Team
    `,
  }),

  progressReport: (employee, stats) => ({
    subject: `Your Onboarding Progress - ${stats.completionRate}% Complete`,
    body: `
      Hi ${employee.name},
      
      Here's your onboarding progress update:
      
      Completed Tasks: ${stats.completed}
      In Progress: ${stats.inProgress}
      Pending: ${stats.pending}
      Total Tasks: ${stats.total}
      
      Completion Rate: ${stats.completionRate}%
      
      ${stats.completionRate === 100 
        ? 'Congratulations! You\'ve completed all your onboarding tasks!' 
        : 'Keep up the great work!'}
      
      Best regards,
      HR Team
    `,
  }),
};
