# EduForge — Course Management Portal

A full-stack instructor + student portal with AI-powered slide generation, resource curation, and visualizer creation for deep learning courses.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express (ESM) |
| Database | PostgreSQL on Neon (serverless) |
| Auth | JWT (bcrypt passwords) |
| AI | Anthropic Claude via official SDK |
| Hosting | Render (both services) |

---

## Local Development Setup

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

**Backend** — copy and fill in:
```bash
cp backend/.env.example backend/.env
```

Required values:
- `DATABASE_URL` — your Neon connection string (with `?sslmode=require`)
- `JWT_SECRET` — generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ANTHROPIC_API_KEY` — your key from console.anthropic.com

**Frontend** — copy and fill in:
```bash
cp frontend/.env.example frontend/.env
```

For local dev, `VITE_API_URL` can be left empty (Vite proxy handles it).

### 3. Set up database

```bash
cd backend
npm run db:migrate    # creates all tables
npm run db:seed       # creates demo instructor + student + course
```

Demo accounts created by seed:
- Instructor: `instructor@eduforge.com` / `instructor123`
- Student: `ayesha@student.edu` / `student123`

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

Visit: http://localhost:5173

---

## Deploying to Render

### Step 1 — Neon Database
1. Go to neon.tech → create project → create database named `eduforge`
2. Copy the connection string (it looks like `postgresql://user:pass@host/eduforge?sslmode=require`)

### Step 2 — Deploy Backend
1. Push this repo to GitHub
2. Go to render.com → New → Web Service
3. Connect your repo, set Root Directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` → your Neon string
   - `JWT_SECRET` → a long random string
   - `ANTHROPIC_API_KEY` → your key
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → (fill in after frontend deploy)
7. Deploy — note the URL e.g. `https://eduforge-api.onrender.com`

### Step 3 — Run Migrations
Once backend is live, run migrations via Render Shell or locally pointing at Neon:
```bash
DATABASE_URL="your-neon-url" npm run db:migrate
DATABASE_URL="your-neon-url" npm run db:seed
```

### Step 4 — Deploy Frontend
1. New → Static Site on Render
2. Root Directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` → your backend URL e.g. `https://eduforge-api.onrender.com`
6. Deploy

### Step 5 — Link Frontend URL in Backend
Go back to your backend service on Render, update `FRONTEND_URL` to your frontend URL.

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user |

### Courses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/courses` | Bearer | List courses (role-aware) |
| POST | `/api/courses` | Instructor | Create course |
| PATCH | `/api/courses/:id` | Instructor | Update course |
| DELETE | `/api/courses/:id` | Instructor | Delete course |
| POST | `/api/courses/:id/modules` | Instructor | Add module |
| PATCH | `/api/courses/:id/modules/:mid` | Instructor | Update/toggle module |
| POST | `/api/courses/:id/modules/:mid/lessons` | Instructor | Add lesson |
| PATCH | `/api/courses/:id/modules/:mid/lessons/:lid` | Instructor | Update/toggle lesson |

### Lessons
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/lessons/:id` | Bearer | Get lesson with slides + resources |
| PUT | `/api/lessons/:id/slides` | Instructor | Save slides JSON |
| POST | `/api/lessons/:id/resources` | Instructor | Add resource |
| PATCH | `/api/lessons/:lid/resources/:rid` | Instructor | Update/toggle resource |
| DELETE | `/api/lessons/:lid/resources/:rid` | Instructor | Delete resource |

### Students
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/students` | Instructor | List all students |
| POST | `/api/students` | Instructor | Register student |
| PATCH | `/api/students/:id` | Instructor | Update student |
| DELETE | `/api/students/:id` | Instructor | Delete student |
| POST | `/api/students/:id/enroll` | Instructor | Enroll in course |
| DELETE | `/api/students/:id/enroll/:cid` | Instructor | Unenroll from course |

### AI (rate limited: 20 req/min)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/slides` | Instructor | Generate slide deck JSON |
| POST | `/api/ai/resources` | Instructor | Suggest resources for topic |
| POST | `/api/ai/visualizer` | Instructor | Generate HTML visualizer |

---

## Project Structure

```
eduforge/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── client.js       # Neon connection
│   │   │   ├── migrate.js      # Schema creation
│   │   │   └── seed.js         # Demo data
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Login / me
│   │   │   ├── courses.js      # Courses, modules, lessons CRUD
│   │   │   ├── lessons.js      # Slides + resources
│   │   │   ├── students.js     # Student management
│   │   │   └── ai.js           # Claude-powered generation
│   │   └── index.js            # Express app
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── utils/
│   │   │   └── api.js           # All backend calls
│   │   ├── components/          # Shared UI components
│   │   ├── pages/               # Route-level pages
│   │   └── hooks/               # Custom React hooks
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml                  # Render deployment config
└── README.md
```
