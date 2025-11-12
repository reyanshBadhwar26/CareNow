#!/bin/bash
# Quick test to verify server can start

echo "Testing CareNow server..."
echo "=========================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 is not installed"
    exit 1
fi
echo "✓ Python 3 found"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠ Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check dependencies
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠ Dependencies not installed. Installing..."
    pip install -r requirements.txt
fi
echo "✓ Dependencies installed"

# Check port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠ Port 8000 is in use. Killing existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Test server import
if python3 -c "import server" 2>/dev/null; then
    echo "✓ Server imports successfully"
else
    echo "✗ Server import failed"
    exit 1
fi

echo ""
echo "=========================="
echo "✓ Server is ready to start!"
echo ""
echo "To start the server, run:"
echo "  python3 server.py"
echo ""
echo "Or use:"
echo "  ./start.sh"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:8000"
