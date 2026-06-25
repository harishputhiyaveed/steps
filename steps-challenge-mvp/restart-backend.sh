#!/bin/bash

echo "🔄 Restarting backend server..."

# Kill existing backend process
pkill -f "uvicorn main:app" || true

# Wait a moment
sleep 2

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

echo "✅ Backend restarted!"
echo "Backend running at http://localhost:8000"

# Made with Bob
