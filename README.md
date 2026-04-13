# Task Management System

A Full-Stack Task Management application using the MERN stack (MongoDB, Express, React, Node.js) and Docker.

## Features
- JWT Authentication & Authorization (User vs Admin)
- Create, Read, Update, Delete (CRUD) tasks and users
- File Uploads (Attach up to 3 PDFs per task)
- Filter/Sort tasks (by status, priority, due date)
- Responsive UI using TailwindCSS
- Docker containerized with `docker-compose.yml`
- API documentation via Swagger

## Setup Instructions

### 1. Run using Docker (Recommended)
Make sure you have Docker and Docker Compose installed.
```bash
docker-compose up --build
```
- Frontend will run on: `http://localhost:5173`
- Backend API will run on: `http://localhost:5000`
- Swagger Docs available at: `http://localhost:5000/api-docs`

### 2. Manual Setup
If you want to run it without Docker:

**Backend**:
Ensure MongoDB is running locally on port 27017.
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

## Testing
To run the automated backend Auth tests using Jest & Supertest:
```bash
cd backend
npm test
```
