# Mini CRM System

A production-ready mini CRM with authentication, role-based access control, lead/customer management, and analytics dashboard.

## Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin, Agent)
- Protected routes on both frontend and backend

### Lead Management
- Create, read, update, and soft delete leads
- Lead status tracking (New, In Progress, Closed Won, Closed Lost)
- Lead conversion to customers
- Search and filter functionality
- Lead assignment to agents

### Customer Management
- Full CRUD operations for customers
- Customer notes system (shows latest 5)
- Customer tags and company information
- Ownership-based access control

### Task Management
- Task creation with due dates and priorities
- Task status tracking (Open, In Progress, Done)
- Task assignment to leads or customers
- Overdue task indicators with red badges
- Task filtering by status and overdue status
- Visual priority and status badges

### Dashboard & Analytics
- Lead status breakdown
- Total customers count
- Open and overdue tasks count
- Leads created per day chart (last 14 days)
- Recent activity feed

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Express Validator for input validation
- Helmet for security
- Morgan for logging

### Frontend
- Next.js 13
- React 18
- Tailwind CSS for styling
- SWR for data fetching
- Recharts for analytics
- React Hook Form for form handling

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd mini-crm-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd mini-crm-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

5. Start the development server:
```bash
npm run dev
```

## Default Credentials

After running the seed script, you can login with:

**Admin User:**
- Email: admin@crm.com
- Password: Admin@123

**Agent Users:**
- Email: agent1@crm.com / agent2@crm.com
- Password: Agent@123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Register new user (Admin only)

### Leads
- `GET /api/leads` - List leads with filtering and pagination
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Soft delete lead
- `POST /api/leads/:id/convert` - Convert lead to customer

### Customers
- `GET /api/customers` - List customers with filtering and pagination
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PATCH /api/customers/:id` - Update customer
- `POST /api/customers/:id/notes` - Add note to customer

### Tasks
- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task

### Dashboard & Activity
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/activity` - Get recent activity feed

## Database Schema

### Users
- name, email, password, role (admin/agent), isActive

### Leads
- name, email, phone, status, source, assignedAgent, archived, history

### Customers
- name, company, email, phone, notes, tags, owner, deals

### Tasks
- title, dueDate, status, priority, relatedType, relatedId, owner

### Activities
- type, actor, entityType, entityId, message, meta

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control with proper data filtering
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Protected routes middleware
- Agents can only see their own data (leads, customers, tasks, activities)
- Admins can see all data across the system

## Development

### Running Tests
```bash
# Backend
cd mini-crm-backend
npm test

# Frontend
cd mini-crm-frontend
npm test
```

### Building for Production
```bash
# Backend
cd mini-crm-backend
npm run build

# Frontend
cd mini-crm-frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
