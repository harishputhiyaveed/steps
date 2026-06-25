# 📁 Project Structure Reference

## Complete File Tree

```
steps-challenge-mvp/
│
├── 📄 README.md                          # Main project documentation
├── 📄 IMPLEMENTATION_SUMMARY.md          # What was built and why
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 🚀 start.sh                           # One-command startup script
│
├── 📂 backend/                           # Python FastAPI backend
│   ├── 📄 main.py                        # FastAPI app with all endpoints
│   ├── 📄 models.py                      # SQLAlchemy database models
│   ├── 📄 schemas.py                     # Pydantic validation schemas
│   ├── 📄 auth.py                        # Authentication utilities
│   ├── 📄 database.py                    # Database configuration
│   ├── 📄 seed.py                        # Sample data generator
│   ├── 📄 requirements.txt               # Python dependencies
│   ├── 📄 README.md                      # Backend documentation
│   ├── 📂 venv/                          # Python virtual environment (created on setup)
│   └── 📄 steps_challenge.db             # SQLite database (created on first run)
│
└── 📂 frontend/                          # React TypeScript frontend
    ├── 📄 package.json                   # npm dependencies
    ├── 📄 package-lock.json              # npm lock file
    ├── 📄 vite.config.ts                 # Vite configuration
    ├── 📄 tsconfig.json                  # TypeScript configuration
    ├── 📄 tailwind.config.js             # Tailwind CSS configuration
    ├── 📄 postcss.config.js              # PostCSS configuration
    ├── 📄 index.html                     # HTML entry point
    ├── 📄 README.md                      # Frontend documentation
    │
    ├── 📂 src/                           # Source code
    │   ├── 📄 main.tsx                   # React entry point
    │   ├── 📄 App.tsx                    # Main app component with routing
    │   ├── 📄 index.css                  # Global styles with Tailwind
    │   │
    │   ├── 📂 components/                # Reusable components
    │   │   ├── 📂 auth/                  # Authentication components
    │   │   │   ├── 📄 LoginForm.tsx      # Login form
    │   │   │   └── 📄 RegisterForm.tsx   # Registration form
    │   │   │
    │   │   ├── 📂 dashboard/             # Dashboard components
    │   │   │   ├── 📄 StepEntryForm.tsx  # Step entry form
    │   │   │   └── 📄 UserStats.tsx      # User statistics display
    │   │   │
    │   │   └── 📂 leaderboards/          # Leaderboard components
    │   │       └── 📄 LeaderboardTable.tsx # Reusable leaderboard table
    │   │
    │   ├── 📂 pages/                     # Page components
    │   │   ├── 📄 LandingPage.tsx        # Public landing page
    │   │   └── 📄 UserDashboard.tsx      # Authenticated user dashboard
    │   │
    │   ├── 📂 contexts/                  # React contexts
    │   │   └── 📄 AuthContext.tsx        # Authentication state management
    │   │
    │   ├── 📂 services/                  # API services
    │   │   └── 📄 api.ts                 # Axios API client
    │   │
    │   ├── 📂 types/                     # TypeScript types
    │   │   └── 📄 index.ts               # Type definitions
    │   │
    │   └── 📂 utils/                     # Utility functions
    │       └── 📄 formatters.ts          # Number and date formatters
    │
    └── 📂 node_modules/                  # npm packages (created on npm install)
```

## File Purposes

### Root Level

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Main project documentation with setup instructions | 301 |
| `IMPLEMENTATION_SUMMARY.md` | Detailed summary of what was built | 424 |
| `PROJECT_STRUCTURE.md` | This file - project structure reference | - |
| `start.sh` | Automated startup script for both servers | 84 |

### Backend Files

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `main.py` | FastAPI application | 254 | All API endpoints, CORS, routing |
| `models.py` | Database models | 31 | User, StepEntry models |
| `schemas.py` | Request/response schemas | 77 | Pydantic validation |
| `auth.py` | Authentication | 82 | JWT, password hashing |
| `database.py` | Database setup | 25 | SQLite configuration |
| `seed.py` | Sample data | 117 | 10 users, 6 teams, random steps |
| `requirements.txt` | Dependencies | 8 | Python packages |

### Frontend Files

#### Core
| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `main.tsx` | React entry | ~10 | Renders App component |
| `App.tsx` | Main app | 52 | Routing, auth provider |
| `index.css` | Global styles | 12 | Tailwind directives |

#### Types & Services
| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `types/index.ts` | TypeScript types | 76 | All interfaces |
| `services/api.ts` | API client | 95 | Axios, auth interceptor |
| `contexts/AuthContext.tsx` | Auth state | 100 | Login, register, logout |
| `utils/formatters.ts` | Utilities | 28 | Number/date formatting |

#### Components
| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `auth/LoginForm.tsx` | Login UI | 81 | Email/password form |
| `auth/RegisterForm.tsx` | Register UI | 182 | Full registration form |
| `dashboard/StepEntryForm.tsx` | Step entry | 107 | Date + steps input |
| `dashboard/UserStats.tsx` | User stats | 83 | Rank, total steps |
| `leaderboards/LeaderboardTable.tsx` | Leaderboard | 127 | Auto-refresh, ranking |

#### Pages
| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `pages/LandingPage.tsx` | Public page | 47 | Auth forms + leaderboards |
| `pages/UserDashboard.tsx` | User page | 72 | Step entry + stats + leaderboards |

## Component Hierarchy

```
App (AuthProvider)
├── Router
    ├── / (Public)
    │   └── LandingPage
    │       ├── RegisterForm
    │       ├── LoginForm
    │       ├── LeaderboardTable (users)
    │       └── LeaderboardTable (teams)
    │
    └── /dashboard (Protected)
        └── UserDashboard
            ├── StepEntryForm
            ├── UserStats
            ├── LeaderboardTable (users)
            └── LeaderboardTable (teams)
```

## Data Flow

```
User Action
    ↓
Component (React)
    ↓
API Service (axios)
    ↓
Backend Endpoint (FastAPI)
    ↓
Database (SQLite)
    ↓
Response
    ↓
Component Update
    ↓
UI Refresh
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Steps
- `POST /api/steps` - Submit step entry
- `GET /api/steps/me` - Get user's steps

### Leaderboards
- `GET /api/leaderboards/users` - Individual leaderboard
- `GET /api/leaderboards/teams` - Team leaderboard

### User Stats
- `GET /api/users/me/stats` - Get user statistics

### Utility
- `GET /api/teams` - Get available teams
- `GET /` - API info

## Database Schema

```sql
users
├── id (PK)
├── full_name
├── email (unique)
├── password_hash
├── team_name
└── created_at

step_entries
├── id (PK)
├── user_id (FK → users.id)
├── date
├── steps
└── created_at
```

## Key Dependencies

### Backend
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `python-jose` - JWT
- `passlib` - Password hashing
- `pydantic` - Validation

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling
- `typescript` - Type safety
- `vite` - Build tool

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.js` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS plugins |
| `package.json` | npm dependencies and scripts |
| `requirements.txt` | Python dependencies |

## Environment Variables

### Backend
- `SECRET_KEY` - JWT secret (hardcoded in MVP)
- `DATABASE_URL` - SQLite path (hardcoded in MVP)

### Frontend
- `VITE_API_URL` - Backend URL (hardcoded to localhost:8000)

## Build Outputs

### Backend
- `steps_challenge.db` - SQLite database file
- `__pycache__/` - Python bytecode cache

### Frontend
- `node_modules/` - npm packages
- `dist/` - Production build (created with `npm run build`)

## Development vs Production

### Development
- Backend: `python main.py` (auto-reload)
- Frontend: `npm run dev` (hot reload)
- Database: SQLite file
- CORS: Localhost allowed

### Production (Future)
- Backend: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Frontend: Serve `dist/` folder
- Database: PostgreSQL
- CORS: Specific domain
- HTTPS: Required

## Quick Reference Commands

```bash
# Start everything
./start.sh

# Backend only
cd backend && source venv/bin/activate && python main.py

# Frontend only
cd frontend && npm run dev

# Seed database
cd backend && python seed.py

# Build frontend
cd frontend && npm run build

# View API docs
open http://localhost:8000/docs
```

## File Size Summary

- **Total Files**: 29
- **Total Lines**: ~2,386
- **Backend Code**: ~586 lines
- **Frontend Code**: ~1,144 lines
- **Documentation**: ~656 lines
- **Configuration**: ~100 lines

---

**Last Updated**: 2024-06-24