# Task Management System

A Full-Stack Task Management application built with the **MERN stack** (MongoDB, Express, React, Node.js), containerized using **Docker**.

## Features
- **JWT Authentication & Authorization** (User vs Admin roles)
- **CRUD** operations for Users and Tasks
- **File Uploads**: Attach up to 3 PDF documents per task with download links
- **Filter & Sort** tasks by status, priority, and due date
- **Pagination** for tasks and user listings
- **Role-Based Access Control**: Admin dashboard for user management
- **Responsive UI** using TailwindCSS
- **API Documentation** via Swagger UI
- **Automated Tests** using Jest & Supertest (Auth + Task CRUD)
- **Dockerized** with `docker-compose.yml` for single-command setup

---

## Project Structure

```
task-management-system/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Login/Register logic
│   │   ├── taskController.js   # Task CRUD with filtering, sorting, pagination
│   │   └── userController.js   # Admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification + role-based guards
│   │   └── uploadMiddleware.js # Multer config for file uploads
│   ├── models/
│   │   ├── User.js             # User schema (email, password, role)
│   │   └── Task.js             # Task schema (title, desc, status, priority, dueDate, docs)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── tests/
│   │   ├── auth.test.js        # Auth endpoint tests
│   │   └── tasks.test.js       # Task CRUD endpoint tests
│   ├── uploads/                # Local file storage for attached documents
│   ├── swagger.yaml            # API documentation
│   ├── Dockerfile
│   ├── server.js               # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx       # Login form with validation
│   │   │   ├── Register.jsx    # Registration form
│   │   │   ├── Dashboard.jsx   # Task board with filters, sorting, pagination
│   │   │   ├── TaskModal.jsx   # Create/Edit task modal with file upload
│   │   │   ├── AdminPanel.jsx  # Admin user management (CRUD + pagination)
│   │   │   └── ProtectedRoute.jsx # Route guard for auth and admin roles
│   │   ├── slices/
│   │   │   ├── apiSlice.js     # RTK Query endpoints for all APIs
│   │   │   └── authSlice.js    # Auth state management
│   │   ├── store.js            # Redux store configuration
│   │   ├── App.jsx             # Router setup
│   │   └── main.jsx            # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Orchestrates frontend, backend, and MongoDB
└── README.md
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **MERN Stack** | Full JavaScript stack allows code reuse and fast development. MongoDB's flexible schema fits the task model well. |
| **Redux Toolkit (RTK Query)** | Provides automatic caching, refetching, and tag-based invalidation — eliminating manual state management for API calls. |
| **JWT + bcrypt** | Industry standard for stateless authentication. Passwords are hashed with bcrypt before storage. |
| **Multer (Local Storage)** | Simplest file handling approach that works in Docker without external service configuration (S3, etc.). Files served via Express static middleware. |
| **Role-Based Access Control** | Two roles (user/admin) enforced at both middleware and frontend route levels. Admin can manage all users and tasks. |
| **TailwindCSS** | Utility-first CSS framework enables rapid, consistent UI development without writing custom CSS. |
| **Docker Compose** | Single `docker-compose up` brings up the entire stack (frontend, backend, MongoDB) for easy evaluation. |

---

## Setup Instructions

### 1. Run using Docker (Recommended)
Make sure you have Docker and Docker Compose installed.
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Swagger Docs**: `http://localhost:5000/api-docs`

### 2. Manual Setup
If you want to run it without Docker, ensure MongoDB is running locally on port 27017.

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## Testing
To run the automated backend tests using Jest & Supertest:
```bash
cd backend
npm test
```

Test suites cover:
- **Auth API**: Registration, duplicate email rejection, login
- **Task API**: Create, read (with filters), update, delete, 404 handling, auth rejection

---

## API Documentation

Full API docs are available via Swagger UI at `http://localhost:5000/api-docs` when the server is running.

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/tasks` | List tasks (filter, sort, paginate) | User |
| POST | `/api/tasks` | Create a task (with file upload) | User |
| GET | `/api/tasks/:id` | Get task details | User |
| PUT | `/api/tasks/:id` | Update a task | User |
| DELETE | `/api/tasks/:id` | Delete a task | User |
| GET | `/api/users` | List all users (paginated) | Admin |
| POST | `/api/users` | Create a user | Admin |
| PUT | `/api/users/:id` | Update a user | Admin |
| DELETE | `/api/users/:id` | Delete a user | Admin |
