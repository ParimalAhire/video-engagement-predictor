#!/bin/bash
# VideoInsight — Start Script
# Launches both FastAPI backend and React frontend

echo "================================================"
echo "  Starting VideoInsight"
echo "================================================"

# Start backend
echo "Starting backend on http://localhost:8000..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 3

# Start frontend
echo "Starting frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "  VideoInsight is running!"
echo "  Open: http://localhost:3000"
echo "  API:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "================================================"

# Wait and handle shutdown
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
