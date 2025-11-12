# Troubleshooting Guide

## Server Won't Start

### 1. Check if Python is installed
```bash
python3 --version
```
Should be Python 3.8 or higher.

### 2. Check if virtual environment is activated
```bash
which python3
```
Should point to `venv/bin/python3` if virtual environment is activated.

### 3. Check if dependencies are installed
```bash
pip list | grep -E "(fastapi|uvicorn)"
```
Should show fastapi and uvicorn installed.

If not, install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Check if port 8000 is available
```bash
lsof -i :8000
```
If port is in use, kill the process:
```bash
lsof -ti:8000 | xargs kill -9
```

### 5. Try starting the server
```bash
python3 server.py
```

You should see:
```
Using local file storage in /path/to/data
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 6. Test if server is running
Open your browser to:
- http://localhost:8000
- http://localhost:8000/map

Or test with curl:
```bash
curl http://localhost:8000/
```

### 7. Check server logs
If the server starts but you see errors, check the console output for error messages.

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Address already in use"
**Solution**: Port 8000 is already in use
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue: "Permission denied" when running start.sh
**Solution**: Make the script executable
```bash
chmod +x start.sh
```

### Issue: Server starts but pages don't load
**Solution**: 
1. Check if server is actually running: `curl http://localhost:8000/`
2. Check browser console for JavaScript errors (F12)
3. Check if static files are accessible: `curl http://localhost:8000/static/css/styles.css`

### Issue: "Cannot GET /" or 404 errors
**Solution**: 
1. Make sure server is running
2. Check the URL: should be `http://localhost:8000/` (not `http://localhost:8000`)
3. Check server logs for errors

### Issue: Map doesn't show clinics
**Solution**:
1. Check browser console for errors (F12)
2. Check if GeoJSON endpoint works: `curl http://localhost:8000/clinics/geojson`
3. Make sure you have submitted at least one check-in report

### Issue: Location not working
**Solution**:
1. Make sure browser has location permissions enabled
2. Check browser console for geolocation errors
3. Try clicking "Refresh Location" button

## Testing the Server

### Test if server is running:
```bash
python3 test_server.py
```

This will test all endpoints and verify the server is working correctly.

### Manual testing:
1. Start server: `python3 server.py`
2. Open browser: http://localhost:8000
3. Submit a test report
4. Check map: http://localhost:8000/map
5. Verify clinics appear on map

## Getting Help

If you're still having issues:
1. Check server logs for error messages
2. Check browser console for JavaScript errors (F12)
3. Run test script: `python3 test_server.py`
4. Verify all dependencies are installed: `pip list`
5. Check if port 8000 is available: `lsof -i :8000`

## Quick Start Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Port 8000 is available
- [ ] Server starts without errors
- [ ] Browser can access http://localhost:8000
- [ ] Static files load correctly
- [ ] JavaScript files load without errors

