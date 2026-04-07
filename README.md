# Employee Onboarding Task Tracker

A full-stack Employee Onboarding Task Tracker built with Cloudflare Workers, D1 (edge SQLite), and React. This application provides a production-ready solution for managing employee onboarding processes with real-time progress tracking, role-based access control, and a modern responsive UI.

## Features

### Backend (Cloudflare Workers + D1)
- **Edge-First Architecture**: Deployed on Cloudflare's global network for zero cold-start latency
- **D1 Database**: Edge SQLite database with automatic scaling and backups
- **REST API**: Complete CRUD operations for employees and tasks
- **Role-Based Access Control**: Admin vs employee permissions using request headers
- **CORS Support**: Full CORS handling for cross-origin requests
- **Type Safety**: Comprehensive request/response validation
- **Database Migrations**: Structured schema management with seed data

### Frontend (React + TypeScript)
- **Modern UI**: Clean, professional design using Tailwind CSS
- **Component Library**: Reusable components with consistent design system
- **Real-time Updates**: React Query for optimistic updates and caching
- **Responsive Design**: Mobile-first approach that works on all devices
- **Form Validation**: Client-side validation with error handling
- **Progress Tracking**: Visual progress bars and completion metrics
- **Role Switching**: Demo functionality to switch between admin/employee views

## Tech Stack

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Router**: itty-router
- **Language**: JavaScript (ES2022)

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Cloudflare account with Wrangler CLI installed

### 1. Clone and Setup Backend

```bash
# Clone the repository
git clone <repository-url>
cd employee-onboarding-tracker

# Install backend dependencies
npm install

# Authenticate with Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create employee-onboarding-db

# Update wrangler.toml with your database ID
# Edit the database_id field in wrangler.toml

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Start development server
npm run dev
```

The backend will be available at `http://localhost:8787`

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:8787" > .env

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Employees
- `POST /employees` - Create new employee (Admin only)
- `GET /employees` - List all employees (Employee+)

### Tasks
- `POST /tasks` - Create new task (Admin only)
- `GET /tasks/:employeeId` - Get tasks for specific employee (Employee+)
- `PATCH /tasks/:id` - Update task status (Admin only)
- `DELETE /tasks/:id` - Delete task (Admin only)

### Dashboard
- `GET /dashboard` - Get overview statistics (Employee+)

## Database Schema

### Employees Table
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  department TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  employee_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
```

## Role-Based Access Control

The application implements role-based access control using the `X-User-Role` header:

### Admin Role
- Full access to all endpoints
- Can create, update, and delete tasks
- Can create new employees
- Can view all employee data

### Employee Role
- Can view dashboard statistics
- Can view employee lists
- Can view tasks assigned to them
- Cannot modify or delete tasks

## Deployment

### Backend Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# View logs
npm run tail
```

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# Deploy to your preferred hosting service
# The build output will be in the 'build' directory
```

## Development

### Backend Development
```bash
# Start local development server
npm run dev

# Run database migrations
npm run db:migrate

# Execute custom SQL commands
npx wrangler d1 execute --local --command="SELECT * FROM employees"
```

### Frontend Development
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

### Backend (wrangler.toml)
- `ENVIRONMENT`: Set to 'production' for production deployments

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8787)

## Sample Data

The application includes meaningful seed data for testing:

### Employees
- Sarah Chen (Admin, HR)
- David Rodriguez (Employee, Engineering)
- Emily Johnson (Employee, Marketing)
- Alex Thompson (Employee, Sales)
- Maria Garcia (Admin, Engineering)

### Sample Tasks
- HR paperwork completion
- Development environment setup
- Company orientation attendance
- Compliance training
- Security training
- CRM access setup

## Performance Features

- **Edge Computing**: Backend deployed on Cloudflare's global network
- **Database Optimization**: Indexed queries for fast data retrieval
- **Caching Strategy**: React Query provides intelligent caching
- **Lazy Loading**: Components load data as needed
- **Optimistic Updates**: UI updates immediately with rollback on error

## Security Features

- **Input Validation**: All API inputs are validated
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing
- **Role-Based Authorization**: Secure access control
- **Error Handling**: Graceful error responses without information leakage

## Monitoring and Logging

```bash
# View real-time logs
npm run tail

# Check deployment status
npx wrangler deployments list
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] File upload for documents
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-tenant support
- [ ] Integration with HR systems
- [ ] Mobile app development
