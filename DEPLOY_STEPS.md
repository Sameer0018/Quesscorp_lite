# How to Deploy HRMS (Step by Step – Simple Guide)

This guide is written in simple steps so you can put your HRMS app on the internet.  
We will use **Render.com** (free tier) for both the backend and frontend.

---

## What You Need Before Starting

1. **GitHub account** – [github.com](https://github.com) (free)
2. **Render account** – [render.com](https://render.com) (free sign up)
3. **Your project on GitHub** – your HRMS code should be in a GitHub repository

---

## Part 1: Deploy the Django Backend (API)

Think of the backend as the “brain” that stores data and handles requests.

### Step 1: Create a PostgreSQL Database on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and log in.
2. Click **“New +”** → **“PostgreSQL”**.
3. Fill in:
   - **Name:** `hrms-lite-db` (or any name you like)
   - **Database:** `hrms_lite`
   - **User:** `hrms`
   - **Region:** Choose one close to you (e.g. Oregon)
4. Click **“Create Database”**.
5. Wait until it shows **“Available”** (green).
6. Open the database and find **“Internal Database URL”**.  
   **Copy this URL** and keep it safe – you will use it in the next part.  
   It looks like: `postgres://hrms:xxxx@dpg-xxxxx-a.oregon-postgres.render.com/hrms_lite`

### Step 2: Create a Web Service for the Django Backend

1. On Render dashboard, click **“New +”** → **“Web Service”**.
2. **Connect your GitHub** if you haven’t already (connect the account where your HRMS repo is).
3. Select your **HRMS repository**.
4. Use these settings:

   | Setting | Value |
   |--------|--------|
   | **Name** | `hrms-lite-api` (or any name) |
   | **Region** | Same as your database |
   | **Root Directory** | `backend_django` ← **Important!** |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt && python manage.py migrate --noinput` |
   | **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

5. Click **“Advanced”** and add **Environment Variables** (one by one):

   | Key | Value |
   |-----|--------|
   | `PYTHON_VERSION` | `3.11.4` |
   | `SECRET_KEY` | Any long random string (e.g. use a password generator and copy 50 characters) |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | Paste the **Internal Database URL** you copied in Step 1 |
   | `ALLOWED_HOSTS` | `.onrender.com` |
   | `FRONTEND_URL` | Leave empty for now; we will set it after deploying the frontend |

6. Click **“Create Web Service”**.
7. Wait for the first deploy to finish (you will see logs; wait until it says “Your service is live”).
8. Copy your **backend URL** from the top of the page, e.g. `https://hrms-lite-api.onrender.com`.  
   **Save this URL** – the frontend will need it.

### Step 3: (Optional) Add Sample Data

- If your Django app has a `seed` command, you can run it once from your computer:
  - Open terminal in `backend_django`, activate venv, then run:  
    `python manage.py seed`  
  - Or add a one-off “Run command” in Render that runs the same (if you use Render shell).

---

## Part 2: Deploy the Frontend (React App)

The frontend is what users see in the browser (pages, buttons, forms).

### Step 4: Create a Static Site for the Frontend

1. On Render dashboard, click **“New +”** → **“Static Site”**.
2. Connect the **same GitHub repository** (your HRMS repo).
3. Use these settings:

   | Setting | Value |
   |--------|--------|
   | **Name** | `hrms-lite-frontend` (or any name) |
   | **Root Directory** | `frontend` ← **Important!** |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

4. Before clicking **“Create Static Site”**, open **“Environment”** and add:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your **backend URL** from Step 2 (e.g. `https://hrms-lite-api.onrender.com`) |

   **Important:** Do not add a slash at the end. Use `https://hrms-lite-api.onrender.com` not `https://hrms-lite-api.onrender.com/`

5. Click **“Create Static Site”**.
6. Wait for the build to finish. Then copy your **frontend URL**, e.g. `https://hrms-lite-frontend.onrender.com`.  
   **Save this URL.**

### Step 5: Connect Backend and Frontend (CORS)

So that the frontend (your React app) is allowed to talk to the backend:

1. Go back to your **backend** Web Service on Render (the one you created in Step 2).
2. Open **“Environment”**.
3. Find **`FRONTEND_URL`** and set it to your **frontend URL** from Step 4, e.g.  
   `https://hrms-lite-frontend.onrender.com`
4. Save. Render will **redeploy** the backend automatically.

---

## Part 3: Check That Everything Works

### Step 6: Test Your App

1. Open your **frontend URL** in the browser (e.g. `https://hrms-lite-frontend.onrender.com`).
2. Try to open the app, log in (if you have login), and check if employees or other data load.
3. If you see errors:
   - **Backend:** Open the backend URL + `/health` (e.g. `https://hrms-lite-api.onrender.com/health`). You should see `{"status":"ok"}`.
   - **Frontend:** Make sure `VITE_API_URL` in the frontend environment is exactly your backend URL (no typo, no trailing slash).
   - **CORS:** Make sure the backend has `FRONTEND_URL` set to your frontend URL.

---

## Quick Summary (Cheat Sheet)

| What | Where | URL you get |
|------|--------|-------------|
| Database | Render → New → PostgreSQL | Internal Database URL → use as `DATABASE_URL` |
| Backend (Django) | Render → New → Web Service, Root: `backend_django` | e.g. `https://hrms-lite-api.onrender.com` |
| Frontend (React) | Render → New → Static Site, Root: `frontend` | e.g. `https://hrms-lite-frontend.onrender.com` |

**Backend env:** `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `ALLOWED_HOSTS=.onrender.com`, `FRONTEND_URL` = frontend URL  
**Frontend env:** `VITE_API_URL` = backend URL  

After any change in environment variables, Render will redeploy. After changing `VITE_API_URL`, the frontend must **rebuild** (which happens automatically when you save env vars and redeploy).

---

## If Something Goes Wrong

- **Build fails:** Check the build logs on Render. Often it’s a wrong **Root Directory** (`backend_django` or `frontend`) or a missing environment variable.
- **“Cannot connect to API” in browser:** Check `VITE_API_URL` and that the backend is “live” and `/health` returns OK.
- **CORS error in browser:** Set `FRONTEND_URL` on the backend to your exact frontend URL (with `https://`).

You can use this guide like a checklist: do Step 1, then Step 2, then Step 4, then Step 5, then Step 6.
