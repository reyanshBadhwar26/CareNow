#!/usr/bin/env python3
"""Test script to verify CareNow server is working correctly"""

import requests
import time
import subprocess
import sys
from pathlib import Path

def test_server():
    """Test if server is running and responding"""
    base_url = "http://localhost:8000"
    
    print("Testing CareNow server...")
    print("=" * 50)
    
    # Test 1: Home page
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✓ Home page loads successfully")
        else:
            print(f"✗ Home page returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Cannot connect to server: {e}")
        print("\nMake sure the server is running:")
        print("  python3 server.py")
        print("  or")
        print("  ./start.sh")
        return False
    
    # Test 2: Map page
    try:
        response = requests.get(f"{base_url}/map", timeout=5)
        if response.status_code == 200:
            print("✓ Map page loads successfully")
        else:
            print(f"✗ Map page returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Map page error: {e}")
        return False
    
    # Test 3: Static CSS
    try:
        response = requests.get(f"{base_url}/static/css/styles.css", timeout=5)
        if response.status_code == 200:
            print("✓ Static CSS files served correctly")
        else:
            print(f"✗ CSS returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ CSS error: {e}")
        return False
    
    # Test 4: Check-ins endpoint
    try:
        response = requests.get(f"{base_url}/checkins", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Check-ins endpoint works ({len(data)} check-ins)")
        else:
            print(f"✗ Check-ins returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Check-ins error: {e}")
        return False
    
    # Test 5: Clinics endpoint
    try:
        response = requests.get(f"{base_url}/clinics", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Clinics endpoint works ({len(data)} clinics)")
        else:
            print(f"✗ Clinics returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Clinics error: {e}")
        return False
    
    # Test 6: GeoJSON endpoint
    try:
        response = requests.get(f"{base_url}/clinics/geojson", timeout=5)
        if response.status_code == 200:
            data = response.json()
            features = data.get("features", [])
            print(f"✓ GeoJSON endpoint works ({len(features)} features)")
        else:
            print(f"✗ GeoJSON returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ GeoJSON error: {e}")
        return False
    
    print("=" * 50)
    print("✓✓✓ All tests passed! Server is working correctly.")
    print(f"\nServer is running at: {base_url}")
    print(f"  - Home: {base_url}/")
    print(f"  - Map: {base_url}/map")
    return True

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1)

