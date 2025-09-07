# Mini CRM — Full Project Guide

Production-ready mini CRM with authentication, role-based access control, lead/customer/task management, activity logging, and a dashboard. This README is interview-ready: it explains architecture, flows, and trade-offs so you can present the project with confidence.

## Monorepo Layout

```
mini-crm/
  mini-crm-backend/    # Node/Express + MongoDB API
  mini-crm-frontend/   # Next.js React client
  README.md            # This file
```

## Core Features

- Authentication and Authorization
  - JWT-based auth: short-lived access token + long-lived refresh token
  - Role-based access control (RBAC): `admin`, `agent`
  - Backend guards every `/api/*` route; frontend protects pages
- Lead Management
  - CRUD, search/filter, pagination, soft-delete (archive)
  - Statuses: New, In Progress, Closed Won, Closed Lost
  - Convert Lead -> Customer; admin can reassign leads
- Customer Management
  - CRUD, notes, tags, ownership-based access control
- Task Management
  - CRUD, priorities (Low/Medium/High), statuses (Open/In Progress/Done)
  - Related to Lead or Customer, overdue indicators
- Dashboard & Activity
  - Stats: lead status breakdown, customers, tasks, trends
  - Activity log on key operations (create/update/status changes)

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens, express-validator, Helmet, Morgan
- Frontend: Next.js 13, React 18, Tailwind CSS, SWR, Recharts, React Hook Form, Axios

## Running Locally

Prerequisites: Node.js 18+, MongoDB (local or Atlas)

1) Backend
```bash
cd mini-crm-backend
npm install
cp .env.example .env   # create if not present
# .env (example)
# MONGODB_URI=mongodb://localhost:27017/mini-crm
# JWT_ACCESS_SECRET=your-access-secret
# JWT_REFRESH_SECRET=your-refresh-secret
# JWT_ACCESS_EXPIRES=15m
# JWT_REFRESH_EXPIRES=7d
# PORT=4000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000
npm run seed
npm run dev
```

2) Frontend
```bash
cd mini-crm-frontend
npm install
cp .env.example .env.local   # create if not present
# .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm run dev
```

## Default Seeded Users

- Admin: `admin@crm.com` / `Admin@123`
- Agents: `agent1@crm.com` / `Agent@123`, `agent2@crm.com` / `Agent@123`

## First-Time Setup (Bootstrap)

If you're setting up the system for the first time without using the seed data, you can create your first admin user through the web interface:

1. Navigate to the login page
2. Click "🚀 First time? Setup admin user →" (this link only appears when no admin users exist)
3. Fill out the bootstrap form to create your first admin user
4. After creation, you can login and use the regular registration process for additional users

**Note:** The bootstrap process is only available when no admin users exist in the system. Once an admin is created, the bootstrap option disappears and you must use the regular admin-only registration process.

## Architecture Overview

### Backend (mini-crm-backend)

- Entry: `src/server.js` starts Express after Mongo connects (`src/config/db.js`).
- App config: `src/app.js` applies security, JSON parsing, logging, CORS, and mounts routes:
  - `/api/auth` (login/refresh/logout, admin user mgmt)
  - `/api/leads`, `/api/customers`, `/api/tasks`
  - `/api/activity`, `/api/dashboard`
- Middleware:
  - `middleware/auth.js`: verifies Bearer token, attaches `req.user`, enforces roles via `requireRole()`
  - `middleware/errorHandler.js`: 404 + error responses
  - `middleware/activityLogger.js`: `logActivity()` helper saves domain events
- Validation: `utils/validation.js` centralizes express-validator rules and error formatting
- Pagination: `utils/pagination.js` parses `page`, `limit` and computes `skip`
- Controllers implement RBAC and business rules. Examples:
  - Leads (`controllers/leadController.js`)
    - Agents can access only their assigned leads; admins can access all
    - Soft-delete via `archived=true`
    - `convert` creates a Customer, marks lead status `Closed Won`, logs activity
    - `reassign` is admin-only
  - Customers/Tasks guard access by role/ownership similarly
  - Dashboard computes aggregate metrics; Activity lists recent events

Security considerations:
- Password hashing with bcrypt (see `models/User.js`)
- JWT access token verification on every protected route; refresh flow available
- Helmet for security headers; CORS restricted by `CORS_ORIGIN`
- Input validation and sanitization on all mutating routes

### Frontend (mini-crm-frontend)

- App wrapper: `pages/_app.js` provides `AuthProvider`
- Auth state: `context/AuthContext.js`
  - `login(email, password)`: stores `crm_access` and `crm_refresh`, keeps `user` in `crm_auth`
  - `logout()`: clears tokens, notifies API, redirects to `/login`
- API client: `lib/api.js` (Axios)
  - Sets base URL from `NEXT_PUBLIC_API_URL`
  - Request interceptor injects `Authorization: Bearer <access>` if present
  - Response interceptor auto-refreshes on 401 using refresh token; redirects to `/login` on failure
- UI pages (Next.js pages):
  - `/login`: sign-in form, stores tokens and user on success
  - `/`: dashboard
  - `/leads`, `/leads/[id]`: listing with filters/pagination; details page with actions (update, convert, reassign if admin)
  - `/customers`, `/customers/[id]`: listing; details with notes, tags
  - `/tasks`: list/create/update, overdue and status filters

## Detailed Auth and RBAC Flow

1) Login
```http
POST /api/auth/login
{
  "email": "admin@crm.com",
  "password": "Admin@123"
}
```
Response includes `{ accessToken, refreshToken, user }`.
- Frontend stores: `crm_access`, `crm_refresh`, and `crm_auth` (user payload)

2) Using access token
- API requests include `Authorization: Bearer <accessToken>` via interceptor

3) Auto refresh
- On a 401 response, the interceptor calls `POST /api/auth/refresh` with `{ refreshToken }`
- If successful, new access token is stored and the original request is retried
- If refresh fails, tokens are cleared and user is redirected to `/login`

4) RBAC enforcement
- `middleware/auth.js` attaches `{ id, role, name }` to `req.user`
- `requireRole('admin')` guards admin-only routes
- Ownership: for agents, list/detail queries are filtered by `req.user.id`

## API Surface (High-Level)

Authentication
- POST `/api/auth/login` — login
- POST `/api/auth/refresh` — refresh access token
- POST `/api/auth/logout` — logout
- POST `/api/auth/register` — admin only (create users)
- GET `/api/auth/users` — admin only (list users)
- PATCH `/api/auth/users/:id` — admin only (update user)
- DELETE `/api/auth/users/:id` — admin only (delete user)

Leads
- GET `/api/leads` — filters: `status`, `q`, `page`, `limit`, `archived`, `assignedAgent`
- GET `/api/leads/:id`
- POST `/api/leads`
- PATCH `/api/leads/:id`
- DELETE `/api/leads/:id` — soft delete
- POST `/api/leads/:id/convert` — Lead -> Customer
- POST `/api/leads/:id/reassign` — admin only

Customers
- GET `/api/customers` — filters: `q`, `page`, `limit`
- GET `/api/customers/:id`
- POST `/api/customers`
- PATCH `/api/customers/:id`
- POST `/api/customers/:id/notes`

Tasks
- GET `/api/tasks` — filters: `owner`, `status`, `due`
- POST `/api/tasks`
- PATCH `/api/tasks/:id`

Dashboard & Activity
- GET `/api/dashboard`
- GET `/api/activity`

Response patterns:
- List endpoints return `{ page, limit, total, items }`
- Errors return `{ message }` or `{ errors: [ { msg, param, ... } ] }` for validation

## Data Model (Conceptual)

- User: `name`, `email`, `password`, `role` (`admin|agent`), `isActive`
- Lead: `name`, `email`, `phone`, `status`, `source`, `assignedAgent`, `archived`, `history[]`
- Customer: `name`, `company`, `email`, `phone`, `notes[]`, `tags[]`, `owner`
- Task: `title`, `dueDate`, `status`, `priority`, `relatedType` (`Lead|Customer`), `relatedId`, `owner`
- Activity: `type`, `actor`, `entityType`, `entityId`, `message`, `meta`

Notes:
- History arrays capture audit events at the entity level
- Activity collection powers the global recent activity feed

## UI Walkthrough (What to Demo)

1) Login as Admin
- Show redirect to dashboard, top stats, and activity feed

2) Leads
- Create a lead; update status; demonstrate search/filter and pagination
- Convert a lead to a customer; point to activity feed entry
- Reassign a lead (admin-only) and show it reflected in listing/detail

3) Customers
- Open the converted customer; add a note; tag a customer

4) Tasks
- Create a task related to the customer; set due date and priority
- Show overdue styling when applicable

5) RBAC
- Log out; log in as `agent1@crm.com`
- Demonstrate that the agent only sees their leads/customers/tasks

## Environment Variables

Backend `.env`
- `MONGODB_URI` — Mongo connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — secrets for signing tokens
- `JWT_ACCESS_EXPIRES` (e.g., `15m`), `JWT_REFRESH_EXPIRES` (e.g., `7d`)
- `PORT` — default 4000
- `NODE_ENV` — `development|production`
- `CORS_ORIGIN` — comma-separated origins, e.g., `http://localhost:3000`

Frontend `.env.local`
- `NEXT_PUBLIC_API_URL` — e.g., `http://localhost:4000/api`

## Production Notes

- Serve backend behind a reverse proxy (Nginx) with HTTPS; set secure cookies if you move to cookie-based auth
- Configure `CORS_ORIGIN` to known domains
- Use environment-specific secrets management (e.g., cloud secret manager)
- Enable MongoDB indexes and backups; consider connection pool sizing
- Observability: enable structured logs and metrics; add request IDs

## Troubleshooting

- 401 errors repeatedly on frontend: ensure refresh token exists and `/auth/refresh` is reachable; verify time sync and JWT secrets
- CORS blocked: make sure `CORS_ORIGIN` includes the frontend URL and the frontend uses the same origin in `NEXT_PUBLIC_API_URL`
- Mongo connection fails: verify `MONGODB_URI` and that Mongo is running/accessible
- Seed data missing: rerun `npm run seed` in `mini-crm-backend`

## Future Enhancements

- Multi-tenant support (orgs), invitations, and user self-service
- Advanced lead scoring and pipeline stages; custom fields
- Webhooks and integrations (email, Slack, calendar)
- Server-side pagination for all heavy lists in UI; infinite scroll
- E2E tests (Playwright/Cypress) and API tests (Jest/Supertest)
- CI/CD pipeline, containerization, and Terraform/IaC

## License

MIT License
