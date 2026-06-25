#!/bin/bash

echo "🏃 Starting Charity Steps Challenge MVP..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
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

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if database exists, if not seed it
if [ ! -f "steps_challenge.db" ]; then
    echo -e "${YELLOW}📊 Seeding database with sample data...${NC}"
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
echo -e "${BLUE}Backend will run on: ${NC}http://localhost:8000"
echo -e "${BLUE}Frontend will run on: ${NC}http://localhost:5173"
echo -e "${BLUE}API Docs: ${NC}http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Demo credentials:${NC}"
echo "  Email: alice@example.com"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend in background
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait

# Made with Bob
