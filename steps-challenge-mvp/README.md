# 🏃 Charity Steps Challenge - MVP

A full-stack web application for tracking and displaying participant step counts for a charity challenge with real-time leaderboards.

## 🎯 Features

- ✅ User registration and authentication
- ✅ Step entry submission (date + steps)
- ✅ Individual user leaderboard (auto-refreshes every 60s)
- ✅ Team leaderboard (auto-refreshes every 60s)
- ✅ User dashboard with personal stats
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Real-time ranking calculations

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm

### Option 1: Automated Setup (Recommended)

```bash
# Make the script executable
chmod +x start.sh

# Run the startup script
./start.sh
```

This will:
1. Install backend dependencies
2. Install frontend dependencies
3. Seed the database with sample data
4. Start both servers

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed database with sample data
python seed.py

# Start backend server
python main.py
```

Backend will run on: http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 👤 Demo Credentials

The database is pre-seeded with sample users:

- **Email**: `alice@example.com`
- **Password**: `password123`

(All sample users have the same password: `password123`)

## 📊 Available Teams

- 1
- 2
- 3

## 🎮 How to Use

### For New Users

1. Go to http://localhost:5173
2. Fill out the registration form:
   - Enter your full name
   - Enter your email
   - Select a team from the dropdown
   - Create a password (min 6 characters)
3. Click "Register"
4. You'll be automatically logged in and redirected to your dashboard

### For Existing Users

1. Go to http://localhost:5173
2. Enter your email and password in the login form
3. Click "Login"
4. You'll be redirected to your dashboard

### Adding Steps

1. On your dashboard, use the "Add Steps" form
2. Select a date (today or past dates)
3. Enter the number of steps
4. Click "Add Steps"
5. Your stats and leaderboards will update automatically

### Viewing Leaderboards

- **Individual Leaderboard**: Shows all users ranked by total steps
- **Team Leaderboard**: Shows all teams ranked by combined steps
- Both leaderboards auto-refresh every 60 seconds
- Leaderboards are visible on both the landing page and dashboard

## 📁 Project Structure

```
steps-challenge-mvp/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── database.py          # Database configuration
│   ├── seed.py              # Sample data generator
│   ├── requirements.txt     # Python dependencies
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Login & Register forms
│   │   │   ├── dashboard/   # Step entry & stats
│   │   │   └── leaderboards/# Leaderboard tables
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # Auth context
│   │   ├── services/        # API integration
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── README.md
│
├── start.sh                 # Startup script
└── README.md               # This file
```

## 🔧 Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### Test Backend API

Visit http://localhost:8000/docs for interactive API documentation.

### Test Frontend

1. Register a new user
2. Login with existing credentials
3. Add step entries
4. Verify leaderboards update
5. Test on different screen sizes

## 📱 Responsive Design

The application is fully responsive:

- **Desktop (1024px+)**: Side-by-side layout
- **Tablet (768px-1023px)**: Adjusted spacing
- **Mobile (<768px)**: Stacked vertical layout

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- SQL injection prevention (via SQLAlchemy ORM)

## 🐛 Troubleshooting

### Backend won't start

- Ensure Python 3.8+ is installed: `python3 --version`
- Check if port 8000 is available
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start

- Ensure Node.js 18+ is installed: `node --version`
- Check if port 5173 is available
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Database issues

- Delete the database file: `rm backend/steps_challenge.db`
- Re-run seed script: `python backend/seed.py`

### CORS errors

- Ensure backend is running on port 8000
- Check frontend API URL in `frontend/src/services/api.ts`

## 📈 Future Enhancements

- Password reset functionality
- Admin panel for managing users and teams
- WebSocket for real-time updates
- Email notifications
- Data export functionality
- Achievement badges
- Social sharing
- Mobile app

## 📄 License

This project is part of the Charity Steps Challenge initiative.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please check:
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- API Documentation: http://localhost:8000/docs

---

**Built with ❤️ for charity and fitness!** 🏃‍♀️🏃‍♂️

*Keep stepping towards your goal!*