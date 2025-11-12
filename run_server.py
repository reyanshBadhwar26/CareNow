#!/usr/bin/env python3
"""Simple script to start CareNow server with better error handling"""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Check if port is available
import socket
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if is_port_in_use(8000):
    print("⚠ Port 8000 is already in use. Trying to kill existing process...")
    os.system("lsof -ti:8000 | xargs kill -9 2>/dev/null")
    import time
    time.sleep(1)

# Try to import server
try:
    import server
    print("✓ Server module imported successfully")
except Exception as e:
    print(f"✗ Error importing server: {e}")
    sys.exit(1)

# Start server
print("Starting CareNow server...")
print("=" * 50)
print("Server will be available at: http://localhost:8000")
print("Press Ctrl+C to stop the server")
print("=" * 50)

if __name__ == "__main__":
    import uvicorn
    
    try:
        uvicorn.run(
            "server:app",
            host="0.0.0.0",
            port=int(os.getenv("PORT", "8000")),
            reload=False,  # Disable reload for more stable startup
            log_level="info",
        )
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
    except Exception as e:
        print(f"\n✗ Error starting server: {e}")
        sys.exit(1)

