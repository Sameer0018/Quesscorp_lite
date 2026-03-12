# Deploy Node Backend (MongoDB) on Render – Step by Step

Your **Node.js backend** (`backend/`) uses **MongoDB** – no PostgreSQL needed.  
Use **MongoDB Atlas** (free) and deploy the app on Render. Simple steps below.

---

## Before You Start

- Code on **GitHub** (push your Hrms repo).
- **MongoDB Atlas** account – free at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
- **Render** account – free at [render.com](https://render.com).

---

## Step 1: Get Your MongoDB Connection URL (Atlas)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Open your **Cluster** (e.g. Cluster0).
3. Click **“Connect”** → **“Drivers”** (or “Connect your application”).
4. Copy the connection string. It looks like:  
   `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace **`<password>`** with your real database user password (no `<` or `>`).
   - If password has special characters like `@`, `#`, `:`, encode them (e.g. `@` → `%40`).
6. Optional: add database name before `?`:  
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/hrms_lite?retryWrites=true&w=majority`
7. In Atlas: **Network Access** → add **`0.0.0.0/0`** (Allow from anywhere) so Render can connect.  
   Save this URL – you will use it in Step 4 as `DATABASE_URL`.

---

## Step 2: Create a Web Service on Render (No Database)

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **“New +”** → **“Web Service”**.
3. Connect **GitHub** and select your **HRMS repository**.

---

## Step 3: Set Service Settings

| What you see       | What to enter |
|--------------------|----------------|
| **Name**           | `hrms-lite-api` (or any name) |
| **Region**         | Choose one (e.g. Oregon) |
| **Branch**         | `main` (or `master`) |
| **Root Directory** | **`backend`** ← exactly this |
| **Runtime**        | **Node** |
| **Build Command**  | `npm install` |
| **Start Command**  | `npm start` |

---

## Step 4: Add Environment Variables

In **Environment Variables**, add:

| Key              | Value |
|------------------|--------|
| `NODE_ENV`       | `production` |
| `DATABASE_URL`   | Your **full MongoDB Atlas URL** from Step 1 (with real password, no `<password>`) |
| `FRONTEND_URL`   | Leave empty for now; add your frontend URL later (for CORS) |
| `PORT`           | Render sets this automatically – you can leave it blank |

Click **“Create Web Service”**.

---

## Step 5: Deploy and Test

1. Wait for the build to finish (2–4 minutes). Check the **Logs** tab.
2. When it says the service is live, copy your **backend URL**, e.g.  
   `https://hrms-lite-api.onrender.com`
3. Test: open **`https://your-url/health`** in the browser.  
   You should see: `{"status":"ok"}`

---

## Summary (MongoDB – No PostgreSQL)

- You do **not** create PostgreSQL on Render.
- You use **MongoDB Atlas** and paste that URL as `DATABASE_URL`.
- Root Directory = **`backend`**, Build = `npm install`, Start = `npm start`.

When you deploy the frontend, set **`VITE_API_URL`** to this backend URL, and set **`FRONTEND_URL`** on this service to your frontend URL.
