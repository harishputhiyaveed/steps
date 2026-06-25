#!/bin/bash

echo "🏃 Charity Steps Challenge - Complete Setup & Start"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Backend setup
echo -e "${BLUE}📦 Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies (this may take a minute)..."
pip install -q -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

# Seed database if it doesn't exist
if [ ! -f "steps_challenge.db" ]; then
    echo -e "${YELLOW}📊 Seeding database...${NC}"
    python seed.py
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend setup
echo -e "${BLUE}📦 Setting up frontend...${NC}"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Start servers
echo -e "${GREEN}🚀 Starting servers...${NC}"
echo ""
echo -e "${BLUE}Backend:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Teams available: 1, 2, 3${NC}"
echo -e "${YELLOW}Demo login:${NC}"
echo "  Email: alice@example.com"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
echo -e "${GREEN}Starting backend...${NC}"
python main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check /tmp/backend.log${NC}"
    cat /tmp/backend.log
    exit 1
fi

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend
cd "$SCRIPT_DIR/frontend"
echo -e "${GREEN}Starting frontend...${NC}"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 2

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check /tmp/frontend.log${NC}"
    cat /tmp/frontend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "${BLUE}Open your browser to: http://localhost:5173${NC}"
echo ""

# Keep script running and show logs
tail -f /tmp/backend.log /tmp/frontend.log &
TAIL_PID=$!

# Wait for user to stop
wait

# Made with Bob
