# Admin Panel Fix Instructions

## Problem
The `is_admin` field is not being returned by the `/api/auth/me` endpoint even though:
- ✅ The database has the `is_admin` column
- ✅ Alice's record has `is_admin=1` in the database
- ✅ The backend schema includes `is_admin: bool`
- ✅ The backend logs show `is_admin: True`

## Root Cause
The FastAPI server with `--reload` flag is not picking up the code changes to `main.py`. The server needs to be manually restarted.

## Solution

### Option 1: Manual Restart (Recommended)
1. In your terminal, press `Ctrl+C` to stop the backend server
2. Run:
   ```bash
   cd steps-challenge-mvp/backend
   source venv/bin/activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Logout and login again with alice@example.com
4. The Admin Panel button should now work

### Option 2: Use the Seed Script
The backend has a `seed.py` script that recreates the database with proper admin users:
```bash
cd steps-challenge-mvp/backend
source venv/bin/activate
python seed.py
```

Then restart the backend server as in Option 1.

### Option 3: Direct Database Fix (If server restart doesn't work)
If restarting doesn't fix it, there might be an ORM caching issue. Try:
```bash
cd steps-challenge-mvp/backend
rm -f steps_challenge.db
source venv/bin/activate
python seed.py
```

Then restart the backend server.

## Verification
After applying the fix:
1. Login with alice@example.com / password123
2. Open browser console (F12)
3. You should see:
   ```json
   {
     "id": 2,
     "full_name": "Alice Johnson",
     "email": "alice@example.com",
     "team_name": "1",
     "is_admin": true,  // <-- This should now appear!
     "created_at": "..."
   }
   ```
4. The "Admin Panel" button should be visible and clickable
5. Clicking it should navigate to `/admin` dashboard

## Admin Credentials
- alice@example.com / password123 (is_admin=true)
- admin@example.com / admin123 (is_admin=true)