# CareNow - AI-Driven Clinic Wait-Time Predictor

CareNow is an AI-powered, crowdsourced clinic wait-time prediction system that helps patients find clinics with the shortest wait times.

## Features

- 📊 **Real-time Wait Time Reporting**: Submit clinic visit reports with check-in/check-out times
- 🗺️ **Interactive Map**: View clinics on an interactive map with color-coded wait times
- 🤖 **AI Predictions**: Machine learning model predicts wait times for the next hour
- 📈 **Community-Driven**: Crowdsourced data improves predictions over time
- 🎯 **Find Shortest Wait**: Discover clinics with the shortest predicted wait times nearby

## Quick Start

### Prerequisites

- Python 3.8+
- Virtual environment (recommended)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   cd CareNow
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server**:
   ```bash
   python3 server.py
   ```
   
   Or use the startup script:
   ```bash
   ./start.sh
   ```

5. **Open your browser**:
   - Home page: http://localhost:8000
   - Map page: http://localhost:8000/map

## Testing

Test if the server is working:

```bash
python3 test_server.py
```

## Usage

### Submitting a Report

1. Go to http://localhost:8000
2. Fill in the clinic name, check-in/check-out times, and condition
3. Allow location access (or click "Refresh Location")
4. Click "Submit Report"

### Viewing the Map

1. Go to http://localhost:8000/map
2. View clinics on the interactive map
3. Click markers to see clinic details
4. Click "Find Shortest Wait Nearby" to see nearby clinics sorted by wait time

## API Endpoints

- `GET /` - Home page (report form)
- `GET /map` - Map page
- `GET /checkins` - List all check-ins
- `GET /clinics` - List all clinics
- `GET /clinics/geojson` - Get clinics as GeoJSON
- `GET /clinics/nearby` - Get nearby clinics (requires latitude, longitude)
- `POST /checkins` - Submit a new check-in

## Configuration

The server uses local file storage by default. Data is stored in the `data/` directory:

- `checkins_index.json` - All check-in records
- `clinics_index.json` - Clinic aggregations
- `models_wait_time_predictor.pkl` - Trained ML model

### Optional: S3 Storage

To use S3 storage instead of local files, set environment variables:

```bash
export CARENOW_BUCKET=your-bucket-name
export AWS_REGION=us-east-1
```

## Project Structure

```
CareNow/
├── server.py              # Main FastAPI server
├── static/                # Static files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── img/              # Images
│   ├── report.html       # Report page
│   └── map.html          # Map page
├── data/                 # Data storage (local)
│   ├── checkins_index.json
│   ├── clinics_index.json
│   └── models_wait_time_predictor.pkl
├── requirements.txt      # Python dependencies
├── start.sh              # Startup script
└── test_server.py        # Test script
```

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Maps**: Leaflet.js
- **ML**: Reinforcement Learning (Q-learning)
- **Storage**: Local files or AWS S3

## License

MIT License

## Support

For issues or questions, please open an issue on the repository.
