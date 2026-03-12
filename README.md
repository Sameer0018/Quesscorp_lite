# HRMS Lite

Full-stack HRMS Lite with React (Vite + Tailwind) frontend and **two backend options**:

- **Django backend** (`backend_django/`) – Python, DRF, PostgreSQL, **deploy on Render** (recommended).
- **Node.js backend** (`backend/`) – Express, MongoDB/MySQL, Swagger.

## Stack (Django + Render)

- **Backend:** Django 4, Django REST Framework, PostgreSQL (Render), CORS, Gunicorn
- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Deploy:** Render (Web Service + PostgreSQL)

---

## Quick start: Django backend (local)

```bash
cd backend_django
python -m venv venv
# Windows: venv\Scripts\activate  |  Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

- API: http://127.0.0.1:8000/api/employees  
- Health: http://127.0.0.1:8000/health  

Point the frontend at this backend: in `frontend/.env` set `VITE_API_URL=http://localhost:8000`, then `npm run dev` in `frontend/`.

## Deploy Django backend on Render

1. **New → PostgreSQL** – create a database, copy the **Internal Database URL**.
2. **New → Web Service** – connect repo, **Root Directory**: `backend_django`.
3. **Build command:** `./build.sh` (or `pip install -r requirements.txt && python manage.py migrate --noinput`).
4. **Start command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`.
5. **Environment variables:**  
   `SECRET_KEY` (generate), `DEBUG=False`, `DATABASE_URL` (from step 1), `ALLOWED_HOSTS=.onrender.com`, `FRONTEND_URL=https://your-frontend-url` (for CORS).
6. Deploy. Set the frontend’s `VITE_API_URL` to the Render service URL (e.g. `https://hrms-lite-api.onrender.com`).

See `backend_django/README.md` for full details.

---

## Quick start: Node backend (local)

### 1. MySQL (or use MongoDB – see backend/.env.example)

Create a database and user:

```sql
CREATE DATABASE hrms_lite;
CREATE USER 'hrms'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL ON hrms_lite.* TO 'hrms'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and optionally PORT, FRONTEND_URL
# Example: DATABASE_URL=mysql://hrms:your_password@localhost:3306/hrms_lite
#          FRONTEND_URL=http://localhost:5173

npm install
npm run migrate
npm run seed
npm run dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000 (or your backend URL)

npm install
npm run dev
```

- App: `http://localhost:5173`

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/employees` | List employees (query: `page`, `limit`) |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| POST | `/api/attendance` | Mark attendance (body: `employee_id`, `date`, `status`) |
| GET | `/api/attendance/:employee_id` | Get attendance for employee (query: `from`, `to`) |

---

## Deploy to Render

### Backend (Web Service)

1. New → Web Service → Connect your repo, select root or `backend` if you use a monorepo.
2. **Build command:** `npm install` (or `cd backend && npm install` if repo root is project root).
3. **Start command:** `npm run migrate && npm start` (or `cd backend && npm run migrate && npm start`).
4. **Environment:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your Render MySQL (or external) connection string.
   - `FRONTEND_URL` = your frontend URL (e.g. `https://your-frontend.onrender.com`).
5. Deploy. Note the backend URL (e.g. `https://hrms-lite-api.onrender.com`).

### Frontend (Static Site)

1. New → Static Site → Connect repo.
2. **Build command:** `npm install && npm run build` (or `cd frontend && npm install && npm run build`).
3. **Publish directory:** `dist` (or `frontend/dist`).
4. **Environment:**
   - `VITE_API_URL` = your backend URL (e.g. `https://hrms-lite-api.onrender.com`).
5. Deploy.

Then set the backend’s `FRONTEND_URL` to this frontend URL so CORS works.

### Database (Render MySQL)

- Create a MySQL instance in Render, copy the **Internal** or **External** URL into `DATABASE_URL`.
- Ensure the database exists (Render usually creates one per instance). If not, create it via MySQL shell or a one-off script.

---

## Deploy to Railway

### Backend

1. New Project → Deploy from GitHub → select repo.
2. Add MySQL plugin (or use external MySQL); copy `DATABASE_URL` from variables.
3. Set **Root Directory** to `backend` if your backend is in that folder.
4. **Build:** `npm install`
5. **Start:** `npm run migrate && npm start`
6. Add variables: `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend.up.railway.app` (or your frontend URL).
7. Deploy and copy the generated backend URL.

### Frontend

1. New Service → same repo (or monorepo).
2. **Root Directory:** `frontend`
3. **Build:** `npm install && npm run build`
4. **Start:** `npx serve -s dist` (or use Railway’s static site preset if available).
5. Add `VITE_API_URL` = your Railway backend URL.
6. Redeploy so build uses the correct API URL.

---

## Connecting frontend to live backend

- **Local → local:** `VITE_API_URL=http://localhost:3000`
- **Local → deployed API:** `VITE_API_URL=https://your-backend.onrender.com`
- **Deployed frontend → deployed API:** set `VITE_API_URL` in the frontend’s build environment to the backend URL. Rebuild and redeploy after changing.

CORS on the backend must allow the frontend origin: set `FRONTEND_URL` (or your frontend URL) in the backend env; the app uses it for `cors({ origin: FRONTEND_URL })`.

---

## Scripts

**Backend**

- `npm run dev` – run with nodemon
- `npm start` – run production server
- `npm run migrate` – run DB migrations (create tables)
- `npm run seed` – seed example employees and attendance (no-op if data exists)

**Frontend**

- `npm run dev` – dev server
- `npm run build` – production build
- `npm run preview` – preview production build

---

## Project structure

```
Hrms/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/runMigrations.js, seed.js
│   │   ├── swagger.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx, main.jsx, index.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```
