# 🚀 Task Management System Deployment Guide

This guide provides a step-by-step path to deploy your full-stack application to the cloud using **MongoDB Atlas**, **Render.com**, and **Vercel**.

---

## Part 1: Setup MongoDB Atlas (Database)

1.  **Create Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2.  **Create Cluster**: Select the "Shared" (Free) tier and create a new cluster.
3.  **Network Access**: 
    - Go to "Network Access" in the sidebar.
    - Click "Add IP Address" and select **"Allow Access from Anywhere"** (0.0.0.0/0). This is necessary because Render/Vercel dynamic IPs change.
4.  **Database Access**:
    - Go to "Database Access".
    - Create a new Database User (e.g., `admin`) and set a strong password. **Save this password.**
5.  **Get Connection String**:
    - Click "Database" in the sidebar.
    - Click "Connect" on your cluster.
    - Select "Drivers" and copy the connection string. It looks like:
      `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    - Replace `<password>` with your actual password.

---

## Part 2: Deploy Backend to Render.com

1.  **Signup/Login**: Login to [Render.com](https://render.com) using your GitHub account.
2.  **New Web Service**:
    - Click "New" -> "Web Service".
    - Connect your GitHub repository.
3.  **Config**:
    - **Name**: `tms-backend`
    - **Root Directory**: `backend` (Important!)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  **Environment Variables**:
    - Click "Advanced" and add:
      - `MONGODB_URI` = (Your Mongo Atlas Connection String)
      - `JWT_SECRET` = (A random long string, e.g., `my_super_secret_123`)
      - `NODE_ENV` = `production`
5.  **Deploy**: Click "Create Web Service". Once it's live, copy the URL (e.g., `https://tms-backend.onrender.com`).

---

## Part 3: Deploy Frontend to Vercel

1.  **Signup/Login**: Visit [Vercel](https://vercel.com) and login with GitHub.
2.  **New Project**:
    - Click "Add New" -> "Project".
    - Import your repository.
3.  **Configure Project**:
    - **Framework Preset**: Vite
    - **Root Directory**: `frontend` (Important!)
4.  **Environment Variables**:
    - Add a new variable:
      - `VITE_API_BASE_URL` = (Your Render Backend URL, e.g., `https://tms-backend.onrender.com`)
      - **Note**: Ensure there is NO trailing slash at the end of the URL.
5.  **Deploy**: Click "Deploy".

---

## Part 4: Final verification

1.  Open your Vercel URL.
2.  Try registering a new user.
3.  Create a task and attach a PDF.
4.  Verify that the dashboard updates in real-time (WebSockets) via the Render backend.

### Troubleshooting
- **CORS Errors**: I've set the backend to `origin: '*'` for compatibility, but if you have issues, ensure the `VITE_API_BASE_URL` in Vercel exactly matches your Render URL.
- **Documents Not Loading**: Note that files uploaded on Render's free tier are stored on a temporary filesystem and will be deleted when the service restarts. For production persistence, use AWS S3 or Cloudinary.

---

## ✅ Deployment Summary Checklist
- [ ] MongoDB Atlas Cluster Created
- [ ] IP Whitelisted (0.0.0.0/0)
- [ ] Backend Deployed to Render (`/backend` subfolder)
- [ ] Frontend Deployed to Vercel (`/frontend` subfolder)
- [ ] `VITE_API_BASE_URL` env var set in Vercel
