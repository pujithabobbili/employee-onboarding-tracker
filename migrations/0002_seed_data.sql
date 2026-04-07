-- Seed data for testing
INSERT INTO employees (name, email, role, department) VALUES 
('Sarah Chen', 'sarah.chen@company.com', 'admin', 'HR'),
('David Rodriguez', 'david.rodriguez@company.com', 'employee', 'Engineering'),
('Emily Johnson', 'emily.johnson@company.com', 'employee', 'Marketing'),
('Alex Thompson', 'alex.thompson@company.com', 'employee', 'Sales'),
('Maria Garcia', 'maria.garcia@company.com', 'admin', 'Engineering');

INSERT INTO tasks (title, description, employee_id, status, priority, due_date) VALUES 
('Complete HR paperwork', 'Fill out all necessary HR forms and documents', 2, 'completed', 'high', '2024-01-15'),
('Setup development environment', 'Install and configure all required development tools', 2, 'in-progress', 'high', '2024-01-20'),
('Attend company orientation', 'Participate in new hire orientation session', 3, 'completed', 'medium', '2024-01-10'),
('Complete compliance training', 'Finish all mandatory compliance courses', 3, 'pending', 'high', '2024-01-25'),
('Review company policies', 'Read and acknowledge company handbook and policies', 4, 'in-progress', 'medium', '2024-01-18'),
('Setup CRM access', 'Get credentials and training for company CRM system', 4, 'pending', 'high', '2024-01-22'),
('Meet with team lead', 'Introduction meeting with direct manager', 2, 'completed', 'medium', '2024-01-08'),
('Complete security training', 'Finish cybersecurity and data protection training', 5, 'completed', 'high', '2024-01-12');
