@echo off
echo ===========================================
echo Setup Script for Task Management System
echo ===========================================
cd /d c:\TMS\task-management-system

echo.
echo [1/7] Initializing Git Repository...
git init

echo.
echo [2/7] Committing Phase 1 (Project Setup)...
git add .gitignore
git commit -m "chore: initialize project and add gitignore"

echo.
echo [3/7] Installing Backend Dependencies (This may take a moment)...
cd backend
call npm install
cd ..

echo.
echo [4/7] Committing Phase 2 (Backend Foundation ^& Auth)...
git add backend/package.json backend/package-lock.json backend/.env backend/server.js backend/config backend/models backend/middleware
git commit -m "feat: setup express server, connect database, and add Auth architecture"

echo.
echo [5/7] Committing Phase 3 (CRUD features)...
git add backend/controllers backend/routes backend/middleware/uploadMiddleware.js
git commit -m "feat: implement User and Task CRUD APIs with file upload support"

echo.
echo [6/7] Committing Phase 4 (Tests ^& Docs)...
git add backend/tests backend/swagger.yaml backend/server.js
git commit -m "test: add jest auth tests and swagger api documentation"

echo.
echo [7/7] Committing Phase 5 and 7 (Frontend ^& Docker)...
git add frontend docker-compose.yml backend/Dockerfile README.md
git commit -m "feat: initialize frontend react configuration and configure docker compose"

echo.
echo ===========================================
echo ALL DONE! Your Git commits are beautiful.
echo ===========================================
pause
