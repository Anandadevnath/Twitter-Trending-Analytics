#!/bin/bash

echo "Starting all services..."
echo ""

# Start ML API in background
echo "1️⃣  Starting ML API (port 8000)..."
cd ml
source venv/bin/activate
uvicorn api:app --reload --port 8000 > ../logs/ml.log 2>&1 &
ML_PID=$!
cd ..

# Start Backend in background
echo "2️⃣  Starting Backend (port 5000)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend in foreground
echo "3️⃣  Starting Frontend (port 3000)..."
cd frontend
npm run dev

# When frontend is stopped, kill the other services
kill $ML_PID $BACKEND_PID 2>/dev/null
echo "All services stopped."
