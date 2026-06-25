# Steps Challenge Backend

FastAPI backend for the Charity Steps Challenge tracker.

## Quick Start

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Seed the database:**
   ```bash
   python seed.py
   ```

4. **Run the server:**
   ```bash
   python main.py
   ```

The API will be available at http://localhost:8000

## API Documentation

Interactive API docs: http://localhost:8000/docs

## Sample Login

- Email: `alice@example.com`
- Password: `password123`

(All seeded users have password: `password123`)

## Available Teams

- 1
- 2
- 3

## Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/steps` - Submit step entry
- `GET /api/steps/me` - Get my steps
- `GET /api/leaderboards/users` - Individual leaderboard
- `GET /api/leaderboards/teams` - Team leaderboard
- `GET /api/users/me/stats` - Get my stats