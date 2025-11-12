# How to Run CareNow Server

## Quick Start

### 1. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 2. Start the Server
```bash
python3 server.py
```

### 3. Open Browser
Navigate to: http://localhost:8000

## Alternative: Use Startup Script

```bash
./start.sh
```

## Verify Server is Running

### Check Server Output
You should see:
```
Using local file storage in /path/to/data
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Test in Browser
1. Open http://localhost:8000 - Should show report page
2. Open http://localhost:8000/map - Should show map page

### Test with curl
```bash
curl http://localhost:8000/
curl http://localhost:8000/clinics/geojson
```

### Run Test Script
```bash
python3 test_server.py
```

## Troubleshooting

### Server Won't Start

1. **Check if port 8000 is in use:**
   ```bash
   lsof -i :8000
   ```
   If port is in use, kill the process:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Check if dependencies are installed:**
   ```bash
   pip list | grep fastapi
   ```
   If not installed:
   ```bash
   pip install -r requirements.txt
   ```

3. **Check for errors in console:**
   Look for error messages when starting the server.

### Server Starts But Pages Don't Load

1. **Check browser console (F12):**
   Look for JavaScript errors or network errors.

2. **Check if static files load:**
   ```bash
   curl http://localhost:8000/static/css/styles.css
   ```
   Should return CSS content.

3. **Check server logs:**
   Look for errors in the terminal where server is running.

### Map Doesn't Show Clinics

1. **Check if you have check-ins:**
   ```bash
   curl http://localhost:8000/checkins
   ```
   Should return a list of check-ins.

2. **Check if clinics are aggregated:**
   ```bash
   curl http://localhost:8000/clinics
   ```
   Should return a list of clinics.

3. **Check GeoJSON endpoint:**
   ```bash
   curl http://localhost:8000/clinics/geojson
   ```
   Should return GeoJSON with features.

4. **Submit a test report:**
   - Go to http://localhost:8000
   - Fill in the form
   - Submit a report
   - Check map at http://localhost:8000/map

## Common Issues

### Issue: "Address already in use"
**Solution**: Port 8000 is already in use
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue: "ModuleNotFoundError"
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Permission denied" on start.sh
**Solution**: Make script executable
```bash
chmod +x start.sh
```

### Issue: Browser shows "Cannot GET /"
**Solution**: 
1. Make sure server is running
2. Check URL: should be `http://localhost:8000/` (with trailing slash)
3. Check server logs for errors

### Issue: Map is blank
**Solution**:
1. Submit at least one check-in report
2. Check browser console for errors (F12)
3. Check if GeoJSON endpoint returns data:
   ```bash
   curl http://localhost:8000/clinics/geojson
   ```

## Running in Background

### Using nohup:
```bash
nohup python3 server.py > server.log 2>&1 &
```

### Using screen:
```bash
screen -S carenow
python3 server.py
# Press Ctrl+A then D to detach
```

### Using tmux:
```bash
tmux new -s carenow
python3 server.py
# Press Ctrl+B then D to detach
```

## Stopping the Server

### If running in foreground:
Press `Ctrl+C`

### If running in background:
```bash
lsof -ti:8000 | xargs kill -9
```

## Testing

### Run quick test:
```bash
./quick_test.sh
```

### Run full test:
```bash
python3 test_server.py
```

### Manual test:
1. Start server: `python3 server.py`
2. Open browser: http://localhost:8000
3. Submit a test report
4. Check map: http://localhost:8000/map
5. Verify clinics appear

## Next Steps

1. Start the server: `python3 server.py`
2. Open browser: http://localhost:8000
3. Submit a test report
4. View map: http://localhost:8000/map
5. Check if clinics appear on map

If you're still having issues, check the troubleshooting guide: `TROUBLESHOOTING.md`

