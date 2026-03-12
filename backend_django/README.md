# HRMS Lite – Django backend

Django backend that matches the Node API so the existing React frontend works unchanged. Deploy to Render with PostgreSQL.

## Local run

```bash
cd backend_django
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Optional: set DATABASE_URL to PostgreSQL, or leave unset for SQLite
python manage.py migrate
python manage.py seed
python manage.py runserver
# API: http://127.0.0.1:8000/api/employees, health: http://127.0.0.1:8000/health
```

## Deploy to Render

### 1. Create PostgreSQL database (Render)

- Dashboard → **New** → **PostgreSQL**
- Create database, note the **Internal Database URL** (or External if your app is elsewhere)

### 2. Create Web Service (Render)

- **New** → **Web Service**
- Connect your repo; set **Root Directory** to `backend_django`
- **Build Command:** `./build.sh` (or `pip install -r requirements.txt && python manage.py migrate --noinput`)
- **Start Command:** `gunicorn config.wsgi:application`
- **Environment:**
  - `SECRET_KEY` – Generate or set a long random string
  - `DEBUG` = `False`
  - `DATABASE_URL` – paste the PostgreSQL connection URL from step 1
  - `ALLOWED_HOSTS` = `.onrender.com` (or add your service URL)
  - `FRONTEND_URL` = your frontend URL (e.g. `https://your-frontend.onrender.com`) for CORS
  - `CORS_ORIGINS` = same as FRONTEND_URL if you use a single origin, or comma-separated list

### 3. Run migrations on first deploy

The `build.sh` script runs `python manage.py migrate`. If you don’t use `build.sh`, add a build step:

```bash
pip install -r requirements.txt && python manage.py migrate --noinput
```

Optional: run seed once via Render **Shell**:

```bash
python manage.py seed
```

### 4. Frontend

Set the frontend’s API URL to your Render backend, e.g.:

- `VITE_API_URL=https://hrms-lite-api.onrender.com`

Then rebuild and deploy the frontend.

## API (same as Node)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/employees | List (query: page, limit) |
| POST | /api/employees | Create |
| GET | /api/employees/<id> | Get one |
| PUT | /api/employees/<id> | Update |
| DELETE | /api/employees/<id> | Delete |
| POST | /api/attendance | Mark (body: employee_id, date, status) |
| GET | /api/attendance/<employee_id> | List by employee (query: from, to) |

Health: `GET /health` → `{"status":"ok"}`
