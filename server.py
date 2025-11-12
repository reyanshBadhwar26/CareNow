import json
import math
import os
import pickle
import re
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("CARENOW_BUCKET") or os.getenv("S3_BUCKET_NAME")
CHECKINS_INDEX_KEY = os.getenv("CHECKINS_INDEX_KEY", "checkins/index.json")
CLINICS_INDEX_KEY = os.getenv("CLINICS_INDEX_KEY", "clinics/index.json")
MODEL_KEY = os.getenv("MODEL_KEY", "models/wait_time_predictor.pkl")

# Use local storage if S3_BUCKET is not set (for development)
USE_LOCAL_STORAGE = not S3_BUCKET
if USE_LOCAL_STORAGE:
    DATA_DIR = Path(__file__).parent / "data"
    DATA_DIR.mkdir(exist_ok=True)
    print(f"Using local file storage in {DATA_DIR}")
    s3_client = None  # Not needed for local storage
else:
    s3_client = boto3.client("s3", region_name=AWS_REGION)
    print(f"Using S3 storage: {S3_BUCKET}")

app = FastAPI(
    title="CareNow",
    description="AI-driven, crowdsourced clinic wait-time predictor",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Wait time prediction model (simple Q-learning based)
class WaitTimePredictor:
    def __init__(self, learning_rate=0.1, discount_factor=0.95):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        # Q-table: (hour_of_day, day_of_week, condition) -> predicted_wait_time
        self.q_table = defaultdict(lambda: 30.0)  # Default 30 minutes
        self.condition_map = {"Smooth": 0, "Busy": 1, "Overloaded": 2}
        self.reverse_condition_map = {0: "Smooth", 1: "Busy", 2: "Overloaded"}

    def _get_state(self, hour: int, weekday: int, condition: str) -> Tuple[int, int, int]:
        """Convert features to state tuple"""
        condition_code = self.condition_map.get(condition, 1)
        return (hour % 24, weekday % 7, condition_code)

    def predict(self, hour: int, weekday: int, recent_condition: str = "Busy") -> float:
        """Predict wait time for next hour"""
        state = self._get_state(hour, weekday, recent_condition)
        return self.q_table[state]

    def update(self, hour: int, weekday: int, condition: str, actual_wait_time: float, predicted_wait_time: float):
        """Update Q-table using reward function"""
        state = self._get_state(hour, weekday, condition)
        
        # Reward: negative of prediction error
        error = abs(actual_wait_time - predicted_wait_time)
        reward = -error
        
        # Simple Q-learning update
        current_q = self.q_table[state]
        # Update towards actual wait time with learning rate
        self.q_table[state] = current_q + self.learning_rate * (actual_wait_time - current_q)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize model to dict"""
        return {
            "q_table": dict(self.q_table),
            "learning_rate": self.learning_rate,
            "discount_factor": self.discount_factor,
            "condition_map": self.condition_map,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WaitTimePredictor":
        """Deserialize model from dict"""
        model = cls(
            learning_rate=data.get("learning_rate", 0.1),
            discount_factor=data.get("discount_factor", 0.95),
        )
        model.q_table = defaultdict(lambda: 30.0, data.get("q_table", {}))
        model.condition_map = data.get("condition_map", {"Smooth": 0, "Busy": 1, "Overloaded": 2})
        model.reverse_condition_map = {v: k for k, v in model.condition_map.items()}
        return model


def _read_static_page(filename: str) -> str:
    path = STATIC_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"Missing static asset: {filename}")
    return path.read_text(encoding="utf-8")


def _load_checkins() -> List[Dict[str, Any]]:
    """Load all check-ins from S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / CHECKINS_INDEX_KEY.replace("/", "_")
        if file_path.exists():
            try:
                return json.loads(file_path.read_text())
            except (json.JSONDecodeError, IOError):
                return []
        return []
    else:
        try:
            obj = s3_client.get_object(Bucket=S3_BUCKET, Key=CHECKINS_INDEX_KEY)
            body = obj["Body"].read()
            return json.loads(body) if body else []
        except s3_client.exceptions.NoSuchKey:
            return []
        except ClientError as exc:
            if exc.response["Error"].get("Code") == "NoSuchKey":
                return []
            raise HTTPException(status_code=500, detail="Unable to load check-ins.") from exc


def _save_checkins(checkins: List[Dict[str, Any]]) -> None:
    """Save all check-ins to S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / CHECKINS_INDEX_KEY.replace("/", "_")
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(json.dumps(checkins, indent=2))
    else:
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=CHECKINS_INDEX_KEY,
                Body=json.dumps(checkins, indent=2).encode("utf-8"),
                ContentType="application/json",
        )
        except ClientError as exc:
            raise HTTPException(status_code=500, detail=f"S3 write failed: {exc.response['Error'].get('Message')}") from exc


def _load_clinics() -> Dict[str, Dict[str, Any]]:
    """Load clinic aggregations from S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / CLINICS_INDEX_KEY.replace("/", "_")
        if file_path.exists():
            try:
                return json.loads(file_path.read_text())
            except (json.JSONDecodeError, IOError):
                return {}
        return {}
    else:
        try:
            obj = s3_client.get_object(Bucket=S3_BUCKET, Key=CLINICS_INDEX_KEY)
            body = obj["Body"].read()
            return json.loads(body) if body else {}
        except s3_client.exceptions.NoSuchKey:
            return {}
        except ClientError as exc:
            if exc.response["Error"].get("Code") == "NoSuchKey":
                return {}
            raise HTTPException(status_code=500, detail="Unable to load clinics.") from exc


def _save_clinics(clinics: Dict[str, Dict[str, Any]]) -> None:
    """Save clinic aggregations to S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / CLINICS_INDEX_KEY.replace("/", "_")
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(json.dumps(clinics, indent=2))
    else:
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=CLINICS_INDEX_KEY,
                Body=json.dumps(clinics, indent=2).encode("utf-8"),
                ContentType="application/json",
        )
        except ClientError as exc:
            raise HTTPException(status_code=500, detail=f"S3 write failed: {exc.response['Error'].get('Message')}") from exc


def _load_model() -> WaitTimePredictor:
    """Load trained model from S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / MODEL_KEY.replace("/", "_")
        if file_path.exists():
            try:
                with open(file_path, "rb") as f:
                    data = pickle.load(f)
                return WaitTimePredictor.from_dict(data)
            except (pickle.PickleError, IOError, KeyError):
                return WaitTimePredictor()
        return WaitTimePredictor()
    else:
        try:
            obj = s3_client.get_object(Bucket=S3_BUCKET, Key=MODEL_KEY)
            body = obj["Body"].read()
            data = pickle.loads(body)
            return WaitTimePredictor.from_dict(data)
        except (s3_client.exceptions.NoSuchKey, ClientError, pickle.PickleError):
            # Return new model if loading fails
            return WaitTimePredictor()


def _save_model(model: WaitTimePredictor) -> None:
    """Save trained model to S3 or local storage"""
    if USE_LOCAL_STORAGE:
        file_path = DATA_DIR / MODEL_KEY.replace("/", "_")
        file_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(file_path, "wb") as f:
                pickle.dump(model.to_dict(), f)
        except (IOError, pickle.PickleError) as exc:
            print(f"Warning: Failed to save model: {exc}")
    else:
        try:
            model_data = pickle.dumps(model.to_dict())
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=MODEL_KEY,
                Body=model_data,
                ContentType="application/octet-stream",
            )
        except ClientError as exc:
            # Log but don't fail if model save fails
            print(f"Warning: Failed to save model: {exc}")


def _compute_wait_time(check_in: str, check_out: str) -> Optional[float]:
    """Compute wait time in minutes from check-in and check-out times"""
    try:
        check_in_time = datetime.fromisoformat(check_in.replace("Z", "+00:00"))
        check_out_time = datetime.fromisoformat(check_out.replace("Z", "+00:00"))
        delta = check_out_time - check_in_time
        return max(0, delta.total_seconds() / 60.0)  # Convert to minutes
    except (ValueError, AttributeError):
        return None


def _calculate_reliability_score(num_reports: int, recency_days: int = 7) -> float:
    """Calculate reliability score based on number of reports and recency"""
    # Base score from number of reports (0-50 points)
    base_score = min(50, num_reports * 2)
    
    # Recency bonus (0-50 points)
    recency_bonus = min(50, recency_days * 7)
    
    return min(100, base_score + recency_bonus)


def _aggregate_clinic_data(clinic_id: str, checkins: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregate check-ins for a clinic to compute statistics (legacy - filters by clinic_id)"""
    clinic_checkins = [c for c in checkins if c.get("clinic_id") == clinic_id]
    
    if not clinic_checkins:
        return {}
    
    return _aggregate_clinic_data_from_list(clinic_id, clinic_checkins)


def _aggregate_clinic_data_from_list(clinic_id: str, clinic_checkins: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregate a list of check-ins for a clinic to compute statistics"""
    if not clinic_checkins:
        return {}
    
    # Calculate average wait time
    wait_times = []
    conditions = []
    recent_checkins = []
    locations = []
    now = datetime.now(timezone.utc)
    
    for checkin in clinic_checkins:
        wait_time = checkin.get("wait_time")
        if wait_time is not None:
            wait_times.append(wait_time)
        
        condition = checkin.get("condition")
        if condition:
            conditions.append(condition)
        
        # Collect locations (for averaging)
        location = checkin.get("location")
        if location and location.get("latitude") and location.get("longitude"):
            locations.append(location)
        
        # Get recent check-ins (last 7 days)
        created_at = checkin.get("created_at")
        if created_at:
            try:
                checkin_time = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                days_ago = (now - checkin_time).days
                if days_ago <= 7:
                    recent_checkins.append(checkin)
            except (ValueError, AttributeError):
                pass
    
    avg_wait_time = sum(wait_times) / len(wait_times) if wait_times else None
    
    # Determine current condition (most common recent condition)
    condition_counts = defaultdict(int)
    for checkin in recent_checkins:
        condition = checkin.get("condition")
        if condition:
            condition_counts[condition] += 1
    
    current_condition = max(condition_counts.items(), key=lambda x: x[1])[0] if condition_counts else "Busy"
    
    # Reliability score
    reliability_score = _calculate_reliability_score(len(clinic_checkins), len(recent_checkins))
    
    # Use most recent location for display on map (same clinic name, different locations)
    # Sort check-ins by created_at to get most recent
    sorted_checkins = sorted(clinic_checkins, key=lambda x: x.get("created_at", ""), reverse=True)
    location = {}
    if sorted_checkins and sorted_checkins[0].get("location"):
        location = sorted_checkins[0].get("location", {})
    elif locations:
        # Fallback to most recent location from locations list
        location = locations[-1]
    
    # Get clinic info from first check-in (for name consistency)
    first_checkin = clinic_checkins[0]
    if not location:
        location = first_checkin.get("location", {})
    
    return {
        "clinic_id": clinic_id,
        "clinic_name": first_checkin.get("clinic_name", "Unknown Clinic"),
        "location": location,
        "average_wait_time": round(avg_wait_time, 1) if avg_wait_time else None,
        "current_condition": current_condition,
        "reliability_score": round(reliability_score, 1),
        "total_reports": len(clinic_checkins),
        "recent_reports": len(recent_checkins),
        "last_updated": now.isoformat(),
    }


def _update_clinic_aggregations(checkins: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Update clinic aggregations from all check-ins, grouping by clinic name"""
    # Group check-ins by normalized clinic name (not by stored clinic_id)
    # This ensures same clinic name = same clinic, regardless of location or old clinic_id format
    clinic_groups = defaultdict(list)
    
    for checkin in checkins:
        clinic_name = checkin.get("clinic_name")
        if not clinic_name:
            continue
        # Normalize clinic name to create consistent clinic_id
        normalized_id = re.sub(r'[^a-z0-9]+', '_', clinic_name.lower().strip()).strip('_')
        clinic_groups[normalized_id].append(checkin)
    
    clinics = {}
    for clinic_id, clinic_checkins in clinic_groups.items():
        # Use the aggregation function but pass all check-ins for this clinic
        clinic_data = _aggregate_clinic_data_from_list(clinic_id, clinic_checkins)
        if clinic_data:
            clinics[clinic_id] = clinic_data
    
    return clinics


def _checkins_to_geojson(clinics: Dict[str, Dict[str, Any]], model: WaitTimePredictor) -> Dict[str, Any]:
    """Convert clinic data to GeoJSON for map display"""
    features = []
    now = datetime.now(timezone.utc)
    
    for clinic_id, clinic_data in clinics.items():
        location = clinic_data.get("location") or {}
        lat = location.get("latitude")
        lon = location.get("longitude")
        
        if lat is None or lon is None:
            continue
        
        try:
            lat = float(lat)
            lon = float(lon)
        except (TypeError, ValueError):
            continue
            
        if math.isnan(lat) or math.isnan(lon):
            continue

        # Predict wait time for next hour
        hour = now.hour
        weekday = now.weekday()
        recent_condition = clinic_data.get("current_condition", "Busy")
        predicted_wait = model.predict(hour, weekday, recent_condition)
        
        # Determine pin color based on wait time
        avg_wait = clinic_data.get("average_wait_time") or predicted_wait
        if avg_wait < 15:
            color = "green"
        elif avg_wait < 30:
            color = "yellow"
        elif avg_wait < 60:
            color = "orange"
        else:
            color = "red"

        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "clinic_id": clinic_id,
                    "clinic_name": clinic_data.get("clinic_name", "Unknown"),
                    "average_wait_time": clinic_data.get("average_wait_time"),
                    "predicted_wait_time": round(predicted_wait, 1),
                    "current_condition": clinic_data.get("current_condition", "Busy"),
                    "reliability_score": clinic_data.get("reliability_score", 0),
                    "total_reports": clinic_data.get("total_reports", 0),
                    "color": color,
                },
            }
        )

    return {"type": "FeatureCollection", "features": features}


DEFAULT_CLINIC_TEMPLATES = [
    {
        "clinic_id": "central_care_clinic",
        "clinic_name": "Central Care Clinic",
        "location": {"latitude": 51.0453, "longitude": -114.0573},
        "average_wait_time": 22.0,
        "current_condition": "Busy",
        "reliability_score": 40,
        "total_reports": 8,
        "recent_reports": 3,
    },
    {
        "clinic_id": "riverside_medical",
        "clinic_name": "Riverside Medical",
        "location": {"latitude": 51.0508, "longitude": -114.0719},
        "average_wait_time": 35.0,
        "current_condition": "Overloaded",
        "reliability_score": 55,
        "total_reports": 15,
        "recent_reports": 5,
    },
    {
        "clinic_id": "northside_health",
        "clinic_name": "Northside Health Centre",
        "location": {"latitude": 51.0805, "longitude": -114.1065},
        "average_wait_time": 12.0,
        "current_condition": "Smooth",
        "reliability_score": 30,
        "total_reports": 6,
        "recent_reports": 2,
    },
]

def _seed_default_clinics() -> Dict[str, Dict[str, Any]]:
    """Provide a set of fallback clinics when no reports exist yet."""
    now_iso = datetime.now(timezone.utc).isoformat()
    seeded: Dict[str, Dict[str, Any]] = {}
    for clinic in DEFAULT_CLINIC_TEMPLATES:
        clinic_copy = clinic.copy()
        clinic_copy["last_updated"] = now_iso
        seeded[clinic_copy["clinic_id"]] = clinic_copy
    return seeded


def _get_current_clinics(regenerate: bool = True) -> Dict[str, Dict[str, Any]]:
    """Return the latest clinic aggregations with sensible fallbacks."""
    clinics: Dict[str, Dict[str, Any]] = {}

    if regenerate:
        checkins = _load_checkins()
        if checkins:
            clinics = _update_clinic_aggregations(checkins)
            if clinics:
                _save_clinics(clinics)

    if not clinics:
        clinics = _load_clinics()

    if not clinics:
        clinics = _seed_default_clinics()
        if clinics:
            _save_clinics(clinics)

    return clinics


@app.get("/", response_class=HTMLResponse)
def checkin_page() -> HTMLResponse:
    return HTMLResponse(_read_static_page("report.html"))


@app.get("/map", response_class=HTMLResponse)
def map_page() -> HTMLResponse:
    return HTMLResponse(_read_static_page("map.html"))


@app.get("/checkins")
def list_checkins() -> JSONResponse:
    checkins = _load_checkins()
    return JSONResponse(content=checkins)


@app.get("/clinics")
def list_clinics() -> JSONResponse:
    """List all clinics, regenerating aggregations if needed"""
    clinics = _get_current_clinics(regenerate=True)
    return JSONResponse(content=list(clinics.values()))


@app.get("/clinics/geojson")
def clinics_geojson() -> JSONResponse:
    """Get clinics as GeoJSON, regenerating aggregations if needed"""
    clinics = _get_current_clinics(regenerate=True)
    model = _load_model()
    return JSONResponse(content=_checkins_to_geojson(clinics, model))


@app.get("/clinics/nearby")
def nearby_clinics(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    radius_km: float = Query(10.0, description="Search radius in kilometers"),
    limit: int = Query(10, description="Maximum number of results"),
) -> JSONResponse:
    """Get nearby clinics sorted by predicted wait time"""
    clinics = _get_current_clinics(regenerate=False)
    model = _load_model()
    now = datetime.now(timezone.utc)
    
    # Calculate distances and predict wait times
    nearby = []
    for clinic_id, clinic_data in clinics.items():
        location = clinic_data.get("location") or {}
        lat = location.get("latitude")
        lon = location.get("longitude")
        if lat is None or lon is None:
            continue
        
        # Simple distance calculation (Haversine approximation)
        lat_diff = abs(latitude - lat)
        lon_diff = abs(longitude - lon)
        distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # Rough km conversion
        
        if distance_km > radius_km:
            continue
        
        # Predict wait time
        hour = now.hour
        weekday = now.weekday()
        recent_condition = clinic_data.get("current_condition", "Busy")
        predicted_wait = model.predict(hour, weekday, recent_condition)
        
        nearby.append({
            **clinic_data,
            "distance_km": round(distance_km, 2),
            "predicted_wait_time": round(predicted_wait, 1),
        })
    
    # Sort by predicted wait time
    nearby.sort(key=lambda x: x.get("predicted_wait_time", 999))
    
    return JSONResponse(content=nearby[:limit])


@app.post("/checkins")
async def create_checkin(
    clinic_name: str = Form(..., min_length=1),
    latitude: float = Form(...),
    longitude: float = Form(...),
    check_in_time: str = Form(...),
    check_out_time: str = Form(...),
    condition: str = Form(..., pattern="^(Smooth|Busy|Overloaded)$"),
):
    """Create a new check-in record"""
    # Validate times
    try:
        check_in_dt = datetime.fromisoformat(check_in_time.replace("Z", "+00:00"))
        check_out_dt = datetime.fromisoformat(check_out_time.replace("Z", "+00:00"))
        if check_out_dt <= check_in_dt:
            raise HTTPException(status_code=400, detail="Check-out time must be after check-in time")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid time format: {e}")
    
    # Calculate wait time
    wait_time = _compute_wait_time(check_in_time, check_out_time)
    if wait_time is None:
        raise HTTPException(status_code=400, detail="Unable to calculate wait time")
    
    # Generate clinic ID from name only (normalized)
    clinic_id = re.sub(r'[^a-z0-9]+', '_', clinic_name.lower().strip()).strip('_')
    
    # Create check-in record
    checkin_id = str(uuid.uuid4())
    checkin = {
        "checkin_id": checkin_id,
        "clinic_id": clinic_id,
        "clinic_name": clinic_name,
        "location": {"latitude": latitude, "longitude": longitude},
        "check_in_time": check_in_time,
        "check_out_time": check_out_time,
        "wait_time": round(wait_time, 1),
        "condition": condition,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Load existing check-ins and add new one
    checkins = _load_checkins()
    checkins.append(checkin)
    _save_checkins(checkins)
    
    # Update clinic aggregations (this will regenerate based on clinic name)
    clinics = _update_clinic_aggregations(checkins)
    _save_clinics(clinics)
    
    # Update model with new data
    model = _load_model()
    hour = check_in_dt.hour
    weekday = check_in_dt.weekday()
    
    # Predict what the model would have predicted
    predicted_wait = model.predict(hour, weekday, condition)
    
    # Update model with actual wait time
    model.update(hour, weekday, condition, wait_time, predicted_wait)
    _save_model(model)
    
    return JSONResponse(content=checkin, status_code=201)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
