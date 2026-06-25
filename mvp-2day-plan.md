# Charity Steps Challenge - 2-Day MVP Plan

## 🎯 MVP Scope (Core Features Only)

### ✅ MUST HAVE (Day 1-2)
- User registration (name, email, team, password)
- User login
- Step entry form
- Individual user leaderboard (auto-refresh every 60s)
- Team leaderboard (auto-refresh every 60s)
- Landing page with registration/login + leaderboards
- User dashboard with step entry + leaderboards
- Basic responsive design

### ❌ DEFERRED (Post-MVP)
- Password reset functionality
- Admin panel
- Audit logging
- WebSocket real-time updates (use polling instead)
- Advanced validation
- Email notifications
- Edit/delete restrictions (just hide UI)
- HTTPS (use HTTP for MVP, add later)

---

## 🛠️ Simplified Tech Stack

### Backend
- **FastAPI** (Python) - Fast to build, auto-docs
- **SQLite** - No setup needed, file-based
- **SQLAlchemy** - Simple ORM
- **JWT** - Simple auth tokens
- **bcrypt** - Password hashing

### Frontend
- **React + Vite** - Fast setup
- **Tailwind CSS** - Quick styling
- **Axios** - API calls
- **React Hook Form** - Simple forms

---

## 📊 Simplified Database Schema

```sql
-- users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    team_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- step_entries table
CREATE TABLE step_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    steps INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- No separate teams table - just use team_name string
-- No admin table - defer to post-MVP
-- No audit logs - defer to post-MVP
```

---

## 🚀 2-Day Implementation Plan

### Day 1 Morning (4 hours) - Backend Foundation
**Goal: Working API with auth and step entry**

1. **Setup (30 min)**
   ```bash
   mkdir steps-challenge-mvp
   cd steps-challenge-mvp
   mkdir backend frontend
   
   # Backend setup
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn sqlalchemy bcrypt python-jose python-multipart
   ```

2. **Database Models (30 min)**
   - Create `models.py` with User and StepEntry models
   - Create `database.py` with SQLite connection
   - Initialize database

3. **Authentication (1 hour)**
   - Create `auth.py` with password hashing and JWT
   - POST `/api/auth/register` endpoint
   - POST `/api/auth/login` endpoint
   - GET `/api/auth/me` endpoint

4. **Step Entry (1 hour)**
   - POST `/api/steps` - Submit steps
   - GET `/api/steps/me` - Get user's steps

5. **Leaderboards (1 hour)**
   - GET `/api/leaderboards/users` - Individual leaderboard
   - GET `/api/leaderboards/teams` - Team leaderboard
   - Simple SQL queries with aggregation

### Day 1 Afternoon (4 hours) - Frontend Foundation
**Goal: Working UI with all core features**

1. **Setup (30 min)**
   ```bash
   cd frontend
   npm create vite@latest . -- --template react-ts
   npm install
   npm install axios react-hook-form tailwindcss
   npx tailwindcss init
   ```

2. **Auth Components (1.5 hours)**
   - `LoginForm.tsx` - Email + password
   - `RegisterForm.tsx` - Name, email, team dropdown, password
   - `AuthContext.tsx` - Store user state
   - Basic validation

3. **Landing Page (1 hour)**
   - Left side: Registration + Login forms
   - Right side: Both leaderboards
   - Simple grid layout

4. **API Integration (1 hour)**
   - `api.ts` - Axios setup with auth headers
   - Connect forms to backend
   - Test registration and login flow

### Day 2 Morning (4 hours) - Core Features
**Goal: Complete user dashboard and leaderboards**

1. **User Dashboard (2 hours)**
   - `UserDashboard.tsx` - Main layout
   - `StepEntryForm.tsx` - Date + steps input
   - `UserStats.tsx` - Show user's total and rank
   - Display leaderboards on right side

2. **Leaderboard Components (1 hour)**
   - `LeaderboardTable.tsx` - Reusable table component
   - Format numbers with commas
   - Show rank, name, steps
   - Auto-refresh every 60 seconds

3. **Routing (30 min)**
   - React Router setup
   - `/` - Landing page (public)
   - `/dashboard` - User dashboard (protected)
   - Redirect logic

4. **Polish (30 min)**
   - Loading states
   - Error messages
   - Basic styling improvements

### Day 2 Afternoon (4 hours) - Testing & Deployment
**Goal: Working MVP ready to demo**

1. **Testing (1.5 hours)**
   - Manual testing of all flows
   - Test with multiple users
   - Test leaderboard calculations
   - Fix critical bugs

2. **Responsive Design (1 hour)**
   - Mobile layout (stack vertically)
   - Tablet layout
   - Test on different screen sizes

3. **Seed Data (30 min)**
   - Create script to add sample teams
   - Add 5-10 test users
   - Add sample step entries
   - Verify leaderboards work

4. **Documentation & Deployment (1 hour)**
   - Create README with setup instructions
   - Create start script
   - Test fresh installation
   - Deploy to simple hosting (optional)

---

## 📁 Minimal File Structure

```
steps-challenge-mvp/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # DB connection
│   ├── auth.py              # Auth utilities
│   ├── schemas.py           # Pydantic schemas
│   ├── seed.py              # Sample data
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── StepEntryForm.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   └── UserStats.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   └── UserDashboard.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── start.sh                 # Start both servers
└── README.md
```

---

## 🎨 Simplified UI Layouts

### Landing Page (MVP)
```
┌─────────────────────────────────────────┐
│           Steps Challenge               │
├──────────────────┬──────────────────────┤
│ REGISTER         │ INDIVIDUAL           │
│ [Name]           │ 1. Alice - 50,000    │
│ [Email]          │ 2. Bob - 45,000      │
│ [Team ▼]         │ 3. Carol - 40,000    │
│ [Password]       │                      │
│ [Register]       │ TEAMS                │
│                  │ 1. Red - 150,000     │
│ LOGIN            │ 2. Blue - 120,000    │
│ [Email]          │ 3. Green - 100,000   │
│ [Password]       │                      │
│ [Login]          │                      │
└──────────────────┴──────────────────────┘
```

### User Dashboard (MVP)
```
┌─────────────────────────────────────────┐
│  Welcome, Alice!        [Logout]        │
├──────────────────┬──────────────────────┤
│ ADD STEPS        │ INDIVIDUAL           │
│ [Date]           │ 1. Alice - 50,000    │
│ [Steps]          │ 2. Bob - 45,000      │
│ [Submit]         │                      │
│                  │ TEAMS                │
│ MY STATS         │ 1. Red - 150,000     │
│ Team: Red        │ 2. Blue - 120,000    │
│ Total: 50,000    │                      │
│ Rank: #1         │                      │
└──────────────────┴──────────────────────┘
```

---

## 🔑 Key Simplifications for Speed

1. **No password reset** - Users can re-register if needed
2. **No admin panel** - Manage via database directly
3. **Polling instead of WebSocket** - Simpler, good enough for MVP
4. **SQLite instead of PostgreSQL** - Zero setup
5. **No email validation** - Just format check
6. **Team as string** - No separate teams table
7. **No edit/delete** - Just hide buttons (add later)
8. **HTTP only** - Add HTTPS in production
9. **Minimal validation** - Just required fields
10. **No tests** - Manual testing only for MVP

---

## ✅ MVP Success Criteria

- [ ] User can register with name, email, team, password
- [ ] User can login with email and password
- [ ] User can submit step entries (date + steps)
- [ ] Individual leaderboard shows all users ranked by total steps
- [ ] Team leaderboard shows all teams ranked by total steps
- [ ] Leaderboards auto-refresh every 60 seconds
- [ ] Landing page shows registration, login, and leaderboards
- [ ] User dashboard shows step entry form and leaderboards
- [ ] Works on desktop and mobile (basic responsive)
- [ ] Can run with single command

---

## 🚀 Quick Start Commands

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py  # Add sample data
python main.py  # Runs on http://localhost:8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

---

## 📝 Post-MVP Enhancements (Week 2+)

1. Password reset functionality
2. Admin panel
3. WebSocket real-time updates
4. PostgreSQL migration
5. Comprehensive validation
6. Email notifications
7. Audit logging
8. HTTPS deployment
9. Unit tests
10. Performance optimization

---

## ⚡ Time-Saving Tips

1. **Copy-paste from similar projects** - Use your Galaxium Travels code as reference
2. **Use AI assistance** - Generate boilerplate code quickly
3. **Skip perfect styling** - Functional > beautiful for MVP
4. **Use default Tailwind** - Don't customize colors yet
5. **Test as you build** - Don't wait until the end
6. **Keep it simple** - Resist feature creep
7. **Use SQLite browser** - Visual tool for debugging
8. **Console.log everything** - Quick debugging
9. **Hard-code team list** - Don't build team management yet
10. **Deploy last** - Get it working locally first

---

## 🎯 Daily Goals

### Day 1 End Goal
- Backend API fully functional
- Frontend can register, login, and view leaderboards
- Basic styling in place

### Day 2 End Goal
- User can submit steps
- Leaderboards calculate correctly
- Auto-refresh working
- Responsive on mobile
- Demo-ready

---

## 🆘 If Running Behind Schedule

**Cut these features:**
1. User stats panel (just show leaderboards)
2. Date picker (use text input)
3. Fancy animations
4. Perfect mobile layout (just stack everything)
5. Error handling (just show alerts)

**Focus on:**
1. Registration works
2. Login works
3. Step submission works
4. Leaderboards show correct data
5. Auto-refresh works
