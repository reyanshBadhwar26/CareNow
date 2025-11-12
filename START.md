# 🚀 START THE SERVER

## The server is NOT currently running. Here's how to start it:

### Option 1: Simple Start (RECOMMENDED)
```bash
cd /Users/zehaanwalji/VSCodeProjects/CareNow
python3 run_server.py
```

### Option 2: Using Startup Script
```bash
cd /Users/zehaanwalji/VSCodeProjects/CareNow
./start.sh
```

### Option 3: Direct Start
```bash
cd /Users/zehaanwalji/VSCodeProjects/CareNow
source venv/bin/activate
python3 server.py
```

## After Starting

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process
INFO:     Application startup complete.
```

## Then Test It

### In Browser:
- Home: http://localhost:8000
- Map: http://localhost:8000/map

### With curl:
```bash
curl http://localhost:8000/
```

## To Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

Or kill it:
```bash
lsof -ti:8000 | xargs kill -9
```

## Quick Test

Run this to verify everything is ready:
```bash
cd /Users/zehaanwalji/VSCodeProjects/CareNow
python3 quick_test.sh
```

## Troubleshooting

### "Address already in use"
```bash
lsof -ti:8000 | xargs kill -9
```

### "ModuleNotFoundError"
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### "Permission denied"
```bash
chmod +x start.sh
chmod +x run_server.py
```

## That's It!

Once the server is running, you can:
1. Open http://localhost:8000 in your browser
2. Submit a clinic wait time report
3. View the map at http://localhost:8000/map
4. See clinics with wait times on the interactive map

