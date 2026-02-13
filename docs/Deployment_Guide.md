# 🚀 Deployment Guide: IT Service Analyst Dashboard

**YES**, deployment is fully possible!

Because this is a MERN Stack app with **Real-time Chat (Socket.io)**, the best strategy is a "Split Deployment":

1.  **Frontend (React)** -> Deployed on **Vercel** (Best for static sites).
2.  **Backend (Node/Express)** -> Deployed on **Render** (Best for servers with WebSockets).

> **Why not Vercel for Backend?**
> Vercel uses "Serverless Functions" which shut down immediately after a request. Socket.io needs a *continuous* connection to work. Render provides a continuous server for free, which is perfect for chat apps.

---

## 1️⃣ Backend Deployment (Do this FIRST)
Platform: **Render** (Free Tier)

1.  **Push your code** to GitHub.
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a **New Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `server` (Important! We are deploying the `server` folder).
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables** (Add these in the "Environment" tab):
    *   `MONGO_URI`: Your MongoDB Connection String (from Atlas).
    *   `JWT_SECRET`: Any secret password (e.g., `mySuperSecretKey123`).
    *   `NODE_ENV`: `production`
6.  Click **Create Web Service**.
7.  Wait for it to deploy. Copy the **URL** (e.g., `https://it-dashboard-api.onrender.com`). This is your new **API URL**.

---

## 2️⃣ Frontend Deployment
Platform: **Vercel**

1.  Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
2.  Import your GitHub repository.
3.  **Framework Preset**: It should auto-detect **Vite**.
4.  **Root Directory**: Click "Edit" and select the `client` folder.
5.  **Environment Variables**:
    *   **Name**: `VITE_API_URL`
    *   **Value**: Paste your **Render Backend URL** (e.g., `https://it-dashboard-api.onrender.com`).
    *   **Name**: `VITE_SOCKET_URL`
    *   **Value**: Paste the **Same Render Backend URL** (e.g., `https://it-dashboard-api.onrender.com`).
    *   *Note: Do NOT add `/api` at the end if your code appends it manually, but usually, just the base URL depending on your axios config.*
6.  Click **Deploy**.

---

## 3️⃣ Final Configuration (Connecting them)

Once both are running:
1.  Go back to your **Render Dashboard** (Backend).
2.  Add a new Environment Variable:
    *   `CLIENT_URL`: Your new **Vercel Frontend URL** (e.g., `https://it-dashboard.vercel.app`).
    *   *This is needed if you have CORS set up to block unknown domains.*
3.  **Redeploy** the Backend (Manual Deploy -> Clear Cache & Deploy) to apply the change.

### ✅ Result
*   Your App is live at: `https://it-dashboard.vercel.app`
*   It talks to your API at: `https://it-dashboard-api.onrender.com`
*   Chat works because Render keeps the socket connection open!
