# Deploy Django Backend (MongoDB) on Render – Step by Step

Put your **backend_django** live on Render using **MongoDB** (no PostgreSQL).  
Follow these steps one by one.

---

## Before You Start

- Your HRMS code is on **GitHub**.
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
   - If the password has special characters like `@`, `#`, `:`, encode them (e.g. `@` → `%40`).
6. Optional: add database name before `?`:  
   `...mongodb.net/hrms_lite?retryWrites=true&w=majority`
7. In Atlas: **Network Access** → add **`0.0.0.0/0`** (Allow from anywhere) so Render can connect.
8. **Save this URL** – you will use it in Step 4 as `DATABASE_URL`.

---

## Step 2: Create a Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **“New +”** → **“Web Service”**.
3. Connect **GitHub** and select your **HRMS repository**.

---

## Step 3: Set Service Settings

| What you see        | What to enter |
|---------------------|----------------|
| **Name**            | `hrms-lite-api` (or any name) |
| **Region**          | Choose one (e.g. Oregon) |
| **Branch**          | `main` (or `master`) |
| **Root Directory**  | **`backend_django`** ← type this exactly |
| **Runtime**         | **Python 3** |
| **Build Command**   | `pip install -r requirements.txt && python manage.py migrate --noinput` |
| **Start Command**   | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

Do **not** click “Create Web Service” yet. Add environment variables next (Step 4).

---

## Step 4: Add Environment Variables

1. Scroll down to **“Environment Variables”**.
2. Click **“Add Environment Variable”** and add **each** of these:

| Key             | Value |
|-----------------|--------|
| `PYTHON_VERSION` | `3.11.4` |
| `SECRET_KEY`     | Any long random string (e.g. from [randomkeygen.com](https://randomkeygen.com)) |
| `DEBUG`          | `False` |
| `DATABASE_URL`   | **Paste your full MongoDB Atlas URL** from Step 1 (with real password, no `<password>`) |
| `ALLOWED_HOSTS`  | `.onrender.com` |
| `FRONTEND_URL`   | Leave empty for now (add your frontend URL later for CORS) |

3. Double-check: **Root Directory** = `backend_django`, **DATABASE_URL** = your MongoDB URL.

---

## Step 5: Deploy

1. Click **“Create Web Service”**.
2. Wait 2–5 minutes. Watch the **“Logs”** tab.
3. When you see “Your service is live”, copy your **backend URL** from the top, e.g.  
   `https://hrms-lite-api.onrender.com`
4. Save this URL. Use it in the frontend as **`VITE_API_URL`**.

---

## Step 6: (Optional) Seed Sample Data

- From your computer: in `backend_django` folder run  
  `python manage.py seed`  
  (with `DATABASE_URL` in `.env` pointing to the same MongoDB Atlas database).
- Or add a one-off **Run command** in Render: `python manage.py seed`.

---

## Step 7: Test Your Live Backend

1. Open in browser: **your-backend-url/health**  
   Example: `https://hrms-lite-api.onrender.com/health`
2. You should see: `{"status":"ok"}`  
   Then try: **your-backend-url/api/employees** – you should get JSON (empty list or seeded data).

---

## Quick Checklist

- [ ] Step 1: MongoDB Atlas URL ready; Network Access allows `0.0.0.0/0`
- [ ] Step 2: New Web Service, repo connected
- [ ] Step 3: Root Directory = `backend_django`, Build & Start commands set
- [ ] Step 4: All 6 environment variables added (**DATABASE_URL** = MongoDB URL)
- [ ] Step 5: Create Web Service, wait for “live”
- [ ] Step 7: Open **your-url/health** and see `{"status":"ok"}`

---

## If Something Goes Wrong

- **Root Directory wrong:** Must be exactly `backend_django`.
- **“No module named …”:** Build command must be  
  `pip install -r requirements.txt && python manage.py migrate --noinput`
- **Database/connection error:** Check `DATABASE_URL` is the full MongoDB Atlas URL, password has no `< >`, and Atlas Network Access allows `0.0.0.0/0`.

---

## After Backend is Live

When you deploy the **frontend**:

1. In the frontend’s environment, set **`VITE_API_URL`** = your backend URL (e.g. `https://hrms-lite-api.onrender.com`).
2. In this backend’s environment on Render, set **`FRONTEND_URL`** = your frontend URL (for CORS).

No PostgreSQL is used – everything runs on **MongoDB**.
