# Charity Steps Challenge Tracker - Technical Implementation Plan

## 1. Project Overview

**Project Name:** Charity Steps Challenge Tracker  
**Version:** 2.0  
**Type:** Full-stack web application  
**Purpose:** Track and display participant step counts for a charity challenge with real-time leaderboards

---

## 2. Technical Architecture

### 2.1 Recommended Technology Stack

#### Backend
- **Framework:** FastAPI (Python 3.10+)
  - Fast, modern, async support
  - Automatic API documentation
  - Built-in data validation with Pydantic
  - WebSocket support for real-time updates
  
- **Database:** PostgreSQL
  - Robust relational database
  - Excellent for aggregations (leaderboards)
  - ACID compliance for data integrity
  
- **ORM:** SQLAlchemy 2.0
  - Type-safe Python ORM
  - Async support
  - Migration management with Alembic

- **Authentication:** 
  - JWT tokens for session management
  - bcrypt for password hashing
  - python-jose for JWT handling

- **Email Service:** 
  - SMTP integration for password reset
  - python-email-validator for validation

#### Frontend
- **Framework:** React 18 with TypeScript
  - Component-based architecture
  - Type safety
  - Large ecosystem
  
- **Build Tool:** Vite
  - Fast development server
  - Optimized production builds
  
- **Styling:** Tailwind CSS
  - Utility-first CSS
  - Responsive design utilities
  - Easy customization

- **State Management:** 
  - React Context API for auth state
  - TanStack Query (React Query) for server state
  
- **Real-time Updates:** 
  - WebSocket connection for leaderboard updates
  - Fallback to polling (60s interval)

- **Form Handling:** 
  - React Hook Form
  - Zod for validation

#### DevOps & Deployment
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **SSL/TLS:** Let's Encrypt certificates
- **Hosting Options:** 
  - AWS (EC2 + RDS)
  - DigitalOcean Droplets
  - Heroku (simpler option)

---

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     Teams       │         │     Users       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ id (PK)         │
│ name            │    1:N  │ full_name       │
│ is_active       │         │ email (unique)  │
│ created_at      │         │ password_hash   │
│ updated_at      │         │ team_id (FK)    │
└─────────────────┘         │ is_active       │
                            │ created_at      │
                            │ updated_at      │
                            └────────┬────────┘
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │   StepEntries   │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ user_id (FK)    │
                            │ date            │
                            │ steps           │
                            │ created_at      │
                            └─────────────────┘

┌─────────────────┐
│  Administrators │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email (unique)  │
│ password_hash   │
│ created_at      │
│ last_login      │
└─────────────────┘

┌─────────────────┐
│   AuditLogs     │
├─────────────────┤
│ id (PK)         │
│ admin_id (FK)   │
│ action          │
│ entity_type     │
│ entity_id       │
│ details (JSON)  │
│ timestamp       │
└─────────────────┘
```

### 3.2 Table Definitions

#### Teams Table
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
```

#### Step Entries Table
```sql
CREATE TABLE step_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER NOT NULL CHECK (steps > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_step_entries_user_id ON step_entries(user_id);
CREATE INDEX idx_step_entries_date ON step_entries(date);
```

#### Administrators Table
```sql
CREATE TABLE administrators (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES administrators(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

#### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
```

---

## 4. API Endpoints Design

### 4.1 Authentication Endpoints

```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
GET    /api/auth/me                - Get current user info
```

### 4.2 User Endpoints

```
GET    /api/users/me               - Get current user profile
GET    /api/users/me/stats         - Get user stats (total steps, ranks)
POST   /api/steps                  - Submit step entry
GET    /api/steps/me               - Get user's step history
```

### 4.3 Leaderboard Endpoints

```
GET    /api/leaderboards/users     - Get individual user leaderboard
GET    /api/leaderboards/teams     - Get team leaderboard
WS     /ws/leaderboards            - WebSocket for real-time updates
```

### 4.4 Admin Endpoints

```
POST   /api/admin/login            - Admin login
GET    /api/admin/teams            - List all teams
POST   /api/admin/teams            - Create team
PUT    /api/admin/teams/:id        - Update team
DELETE /api/admin/teams/:id        - Deactivate team
GET    /api/admin/users            - List all users
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Deactivate user
POST   /api/admin/users/:id/reset  - Trigger password reset
GET    /api/admin/steps            - List all step entries
DELETE /api/admin/steps/:id        - Delete step entry
GET    /api/admin/audit-logs       - View audit logs
```

---

## 5. Frontend Component Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── leaderboards/
│   │   ├── IndividualLeaderboard.tsx
│   │   ├── TeamLeaderboard.tsx
│   │   └── LeaderboardTable.tsx
│   ├── dashboard/
│   │   ├── StepEntryForm.tsx
│   │   ├── UserStats.tsx
│   │   └── DashboardLayout.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── TeamManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── StepManagement.tsx
│   │   └── AuditLogs.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── UserDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── ResetPassword.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useLeaderboards.ts
│   ├── useWebSocket.ts
│   └── useStepEntry.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── websocket.ts
│   └── admin.ts
├── types/
│   └── index.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
└── contexts/
    └── AuthContext.tsx
```

---

## 6. Key Features Implementation Details

### 6.1 Real-time Leaderboard Updates

**Approach 1: WebSocket (Recommended)**
```typescript
// Backend: Broadcast updates when steps are submitted
async def submit_steps(step_entry: StepEntry):
    # Save to database
    await db.save(step_entry)
    
    # Calculate new leaderboards
    user_leaderboard = await calculate_user_leaderboard()
    team_leaderboard = await calculate_team_leaderboard()
    
    # Broadcast via WebSocket
    await websocket_manager.broadcast({
        "type": "leaderboard_update",
        "data": {
            "users": user_leaderboard,
            "teams": team_leaderboard
        }
    })

// Frontend: Subscribe to WebSocket updates
const useLeaderboards = () => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/leaderboards');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            if (update.type === 'leaderboard_update') {
                setData(update.data);
            }
        };
        
        return () => ws.close();
    }, []);
    
    return data;
};
```

**Approach 2: Polling Fallback**
```typescript
// Poll every 60 seconds if WebSocket unavailable
useEffect(() => {
    const interval = setInterval(async () => {
        const data = await fetchLeaderboards();
        setLeaderboards(data);
    }, 60000);
    
    return () => clearInterval(interval);
}, []);
```

### 6.2 Cumulative Steps Calculation

**Database View (Efficient)**
```sql
CREATE MATERIALIZED VIEW user_cumulative_steps AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.team_id,
    COALESCE(SUM(se.steps), 0) as total_steps
FROM users u
LEFT JOIN step_entries se ON u.id = se.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.full_name, u.team_id;

-- Refresh after each step entry
REFRESH MATERIALIZED VIEW user_cumulative_steps;
```

**Leaderboard Query**
```sql
-- Individual Leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY total_steps DESC) as rank,
    user_id,
    full_name,
    total_steps
FROM user_cumulative_steps
ORDER BY total_steps DESC;

-- Team Leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY team_total DESC) as rank,
    t.id as team_id,
    t.name as team_name,
    COALESCE(SUM(ucs.total_steps), 0) as team_total
FROM teams t
LEFT JOIN user_cumulative_steps ucs ON t.id = ucs.team_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name
ORDER BY team_total DESC;
```

### 6.3 Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant EmailService

    User->>Frontend: Click "Forgot Password"
    Frontend->>Backend: POST /api/auth/forgot-password
    Backend->>Database: Check if email exists
    Database-->>Backend: User found
    Backend->>Database: Create reset token
    Backend->>EmailService: Send reset email
    EmailService-->>User: Email with reset link
    User->>Frontend: Click reset link
    Frontend->>Backend: GET /reset-password?token=xxx
    Backend->>Database: Validate token
    Database-->>Backend: Token valid
    Frontend->>User: Show reset form
    User->>Frontend: Enter new password
    Frontend->>Backend: POST /api/auth/reset-password
    Backend->>Database: Update password
    Backend->>Database: Mark token as used
    Backend-->>Frontend: Success
    Frontend-->>User: Redirect to login
```

### 6.4 Responsive Layout Implementation

**Landing Page - Desktop (1024px+)**
```
┌─────────────────────────────────────────────────────┐
│                    HEADER / LOGO                    │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│  REGISTRATION FORM   │  INDIVIDUAL LEADERBOARD      │
│  ┌────────────────┐  │  ┌────────────────────────┐ │
│  │ Full Name      │  │  │ Rank │ Name │ Steps   │ │
│  │ Email          │  │  │  1   │ ...  │ 125,000 │ │
│  │ Team ▼         │  │  └────────────────────────┘ │
│  │ Password       │  │                              │
│  │ Confirm Pass   │  │  TEAM LEADERBOARD            │
│  │ [Register]     │  │  ┌────────────────────────┐ │
│  └────────────────┘  │  │ Rank │ Team │ Steps   │ │
│                      │  │  1   │ ...  │ 350,000 │ │
│  LOGIN FORM          │  └────────────────────────┘ │
│  ┌────────────────┐  │                              │
│  │ Email          │  │                              │
│  │ Password       │  │                              │
│  │ [Login]        │  │                              │
│  │ Forgot Pass?   │  │                              │
│  └────────────────┘  │                              │
└──────────────────────┴──────────────────────────────┘
```

**Landing Page - Mobile (<768px)**
```
┌─────────────────────┐
│   HEADER / LOGO     │
├─────────────────────┤
│ REGISTRATION FORM   │
│ ┌─────────────────┐ │
│ │ Full Name       │ │
│ │ Email           │ │
│ │ Team ▼          │ │
│ │ Password        │ │
│ │ Confirm Pass    │ │
│ │ [Register]      │ │
│ └─────────────────┘ │
├─────────────────────┤
│ LOGIN FORM          │
│ ┌─────────────────┐ │
│ │ Email           │ │
│ │ Password        │ │
│ │ [Login]         │ │
│ │ Forgot Pass?    │ │
│ └─────────────────┘ │
├─────────────────────┤
│ INDIVIDUAL          │
│ LEADERBOARD         │
│ ┌─────────────────┐ │
│ │ 1. User A       │ │
│ │    125,000      │ │
│ └─────────────────┘ │
├─────────────────────┤
│ TEAM LEADERBOARD    │
│ ┌─────────────────┐ │
│ │ 1. Team A       │ │
│ │    350,000      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 7. Security Implementation

### 7.1 Password Security
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 7.2 JWT Authentication
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-here"  # Use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### 7.3 CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.4 Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(request: Request, credentials: LoginCredentials):
    # Login logic
    pass
```

---

## 8. Testing Strategy

### 8.1 Backend Tests
```python
# tests/test_auth.py
def test_user_registration():
    response = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "team_id": 1,
        "password": "SecurePass123",
        "confirm_password": "SecurePass123"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_duplicate_email_registration():
    # First registration
    client.post("/api/auth/register", json=user_data)
    # Duplicate attempt
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

# tests/test_leaderboards.py
def test_individual_leaderboard_ranking():
    # Create users and steps
    # Verify ranking order
    response = client.get("/api/leaderboards/users")
    leaderboard = response.json()
    assert leaderboard[0]["steps"] >= leaderboard[1]["steps"]
```

### 8.2 Frontend Tests
```typescript
// tests/LoginForm.test.tsx
describe('LoginForm', () => {
    it('validates email format', () => {
        render(<LoginForm />);
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
    
    it('submits form with valid credentials', async () => {
        const mockLogin = jest.fn();
        render(<LoginForm onLogin={mockLogin} />);
        // Fill form and submit
        // Verify mockLogin called
    });
});
```

---

## 9. Deployment Architecture

### 9.1 Docker Compose Setup
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: steps_challenge
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/steps_challenge
      SECRET_KEY: ${SECRET_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
    depends_on:
      - postgres
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: https://api.yourdomain.com
    ports:
      - "3000:80"

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

### 9.2 Environment Variables
```bash
# .env.production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key-min-32-chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up project structure
- Initialize Git repositories
- Configure development environment
- Set up database and migrations
- Create base models and schemas

### Phase 2: Backend Core (Week 2)
- Implement authentication system
- Build user registration and login
- Implement password reset flow
- Create step entry endpoints
- Build leaderboard calculation logic

### Phase 3: Frontend Core (Week 3)
- Create landing page layout
- Build registration and login forms
- Implement user dashboard
- Create step entry form
- Display leaderboards

### Phase 4: Real-time Features (Week 4)
- Implement WebSocket connections
- Add real-time leaderboard updates
- Implement auto-refresh fallback
- Add loading states and optimistic updates

### Phase 5: Admin Panel (Week 5)
- Build admin authentication
- Create team management interface
- Build user management interface
- Implement step entry management
- Add audit logging

### Phase 6: Polish & Testing (Week 6)
- Responsive design refinement
- Form validation improvements
- Error handling
- Unit and integration tests
- Performance optimization

### Phase 7: Deployment (Week 7)
- Set up production environment
- Configure SSL certificates
- Deploy database
- Deploy backend and frontend
- Configure monitoring and logging

---

## 11. Success Criteria

✅ All 64 requirements from BRD implemented  
✅ Responsive design works on desktop, tablet, mobile  
✅ Leaderboards update in real-time (or every 60s)  
✅ Passwords securely hashed  
✅ Email validation working  
✅ Admin panel fully functional  
✅ No duplicate email registrations  
✅ Step entries cannot be edited/deleted by users  
✅ HTTPS enabled in production  
✅ Concurrent user support tested  

---

## 12. Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Database performance with many users | Use materialized views, add indexes, implement caching |
| WebSocket connection failures | Implement polling fallback mechanism |
| Email delivery issues | Use reliable SMTP service (SendGrid, AWS SES), add retry logic |
| Concurrent step submissions | Use database transactions, implement optimistic locking |
| Security vulnerabilities | Regular security audits, dependency updates, input validation |
| Mobile responsiveness issues | Test on real devices, use responsive design frameworks |

---

## 13. Future Enhancements (Out of Current Scope)

- Social media sharing
- Push notifications
- Native mobile apps
- Integration with fitness trackers (Fitbit, Apple Health)
- Donation processing
- Challenge start/end date enforcement
- Team chat functionality
- Achievement badges
- Data export functionality

---

## 14. Next Steps

1. **Review this plan** with stakeholders
2. **Confirm technology stack** choices
3. **Set up development environment**
4. **Create initial project structure**
5. **Begin Phase 1 implementation**
