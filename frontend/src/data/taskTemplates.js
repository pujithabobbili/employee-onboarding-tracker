// Pre-defined task templates by department
export const taskTemplates = {
  Engineering: [
    {
      title: 'Setup Development Environment',
      description: 'Install required development tools, IDE, and access to code repositories',
      priority: 'high',
      daysFromStart: 1,
    },
    {
      title: 'Complete Security Training',
      description: 'Complete mandatory security and data protection training',
      priority: 'high',
      daysFromStart: 2,
    },
    {
      title: 'Review Codebase Architecture',
      description: 'Review system architecture documentation and key repositories',
      priority: 'medium',
      daysFromStart: 3,
    },
    {
      title: 'Setup Local Development',
      description: 'Clone repositories and run application locally',
      priority: 'high',
      daysFromStart: 3,
    },
    {
      title: 'First Code Review',
      description: 'Submit first pull request and participate in code review',
      priority: 'medium',
      daysFromStart: 7,
    },
  ],
  HR: [
    {
      title: 'Complete HR Paperwork',
      description: 'Fill out all necessary HR forms and documents',
      priority: 'high',
      daysFromStart: 1,
    },
    {
      title: 'Benefits Enrollment',
      description: 'Review and enroll in company benefits program',
      priority: 'high',
      daysFromStart: 3,
    },
    {
      title: 'Company Policies Review',
      description: 'Read and acknowledge company policies and handbook',
      priority: 'medium',
      daysFromStart: 5,
    },
    {
      title: 'HRIS System Training',
      description: 'Complete training on HR information system',
      priority: 'medium',
      daysFromStart: 7,
    },
  ],
  Marketing: [
    {
      title: 'Brand Guidelines Review',
      description: 'Review company brand guidelines and style guide',
      priority: 'high',
      daysFromStart: 1,
    },
    {
      title: 'Marketing Tools Access',
      description: 'Get access to marketing automation, analytics, and design tools',
      priority: 'high',
      daysFromStart: 2,
    },
    {
      title: 'Campaign Strategy Overview',
      description: 'Review current marketing campaigns and strategy',
      priority: 'medium',
      daysFromStart: 3,
    },
    {
      title: 'Social Media Training',
      description: 'Complete social media policy and best practices training',
      priority: 'medium',
      daysFromStart: 5,
    },
  ],
  Sales: [
    {
      title: 'CRM System Training',
      description: 'Complete training on CRM system and sales processes',
      priority: 'high',
      daysFromStart: 1,
    },
    {
      title: 'Product Knowledge Training',
      description: 'Complete comprehensive product training and certification',
      priority: 'high',
      daysFromStart: 3,
    },
    {
      title: 'Sales Playbook Review',
      description: 'Review sales playbook and best practices',
      priority: 'medium',
      daysFromStart: 5,
    },
    {
      title: 'Shadow Sales Calls',
      description: 'Shadow experienced sales team members on customer calls',
      priority: 'medium',
      daysFromStart: 7,
    },
  ],
  'Customer Support': [
    {
      title: 'Support System Training',
      description: 'Complete training on ticketing and support systems',
      priority: 'high',
      daysFromStart: 1,
    },
    {
      title: 'Product Documentation Review',
      description: 'Review all product documentation and FAQs',
      priority: 'high',
      daysFromStart: 2,
    },
    {
      title: 'Customer Communication Training',
      description: 'Complete customer communication and empathy training',
      priority: 'medium',
      daysFromStart: 3,
    },
    {
      title: 'Shadow Support Sessions',
      description: 'Shadow experienced support team members handling tickets',
      priority: 'medium',
      daysFromStart: 5,
    },
  ],
};

// Calculate due date based on days from start
export const calculateDueDate = (daysFromStart) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromStart);
  return date.toISOString().split('T')[0];
};

// Get templates for a department
export const getTemplatesForDepartment = (department) => {
  return taskTemplates[department] || [];
};
