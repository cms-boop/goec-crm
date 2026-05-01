from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
import csv
import io
from starlette.responses import StreamingResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# In-memory databases
leads_db = []
pixels_db = []  # {id, type, code, name, enabled, created_at}
settings_db = {
    "cms_webhook_url": "",
    "cms_api_key": "",
    "cms_enabled": False
}

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ===== MODELS =====
class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investment_interest: str = ""
    own_land: str = ""
    location: str = ""
    site_visit: str = ""
    name: str = ""
    phone: str = ""
    city: str = ""
    email: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LeadCreate(BaseModel):
    investment_interest: str = ""
    own_land: str = ""
    location: str = ""
    site_visit: str = ""
    name: str = ""
    phone: str = ""
    city: str = ""
    email: str = ""

class TrackingPixel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "facebook_pixel", "google_tag_manager", "google_analytics", "custom"
    code: str
    enabled: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TrackingPixelCreate(BaseModel):
    name: str
    type: str
    code: str
    enabled: bool = True

class TrackingPixelUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    code: Optional[str] = None
    enabled: Optional[bool] = None

class CMSSettings(BaseModel):
    cms_webhook_url: str = ""
    cms_api_key: str = ""
    cms_enabled: bool = False


# ===== LEAD ENDPOINTS =====
@api_router.get("/")
async def root():
    return {"message": "GO EC API"}

import requests

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    lead = Lead(**lead_data.model_dump())
    lead_dict = lead.model_dump()
    leads_db.append(lead_dict)
    
    # Forward to CMS webhook if enabled
    if settings_db.get("cms_enabled") and settings_db.get("cms_webhook_url"):
        try:
            url = settings_db["cms_webhook_url"]
            headers = {"Content-Type": "application/json"}
            if settings_db.get("cms_api_key"):
                headers["Authorization"] = settings_db["cms_api_key"]
            
            # Non-blocking or simple sync request for now
            # In a real app you'd use a background task or httpx for async
            # Using requests in a thread or just blocking briefly for demo
            requests.post(url, json=lead_dict, headers=headers, timeout=5)
        except Exception as e:
            logger.error(f"Failed to push lead to CMS webhook: {e}")
            
    return lead

@api_router.get("/leads")
async def get_leads(
    start_date: Optional[str] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter end date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search by name, email, phone, or city"),
):
    filtered = list(leads_db)
    
    if start_date:
        filtered = [l for l in filtered if l["created_at"][:10] >= start_date]
    if end_date:
        filtered = [l for l in filtered if l["created_at"][:10] <= end_date]
    if search:
        search_lower = search.lower()
        filtered = [l for l in filtered if (
            search_lower in l.get("name", "").lower() or
            search_lower in l.get("email", "").lower() or
            search_lower in l.get("phone", "").lower() or
            search_lower in l.get("city", "").lower()
        )]
    
    # Sort by created_at descending
    filtered.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {"leads": filtered, "total": len(filtered)}

@api_router.get("/leads/export")
async def export_leads(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("csv", description="Export format: csv or json"),
):
    filtered = list(leads_db)
    
    if start_date:
        filtered = [l for l in filtered if l["created_at"][:10] >= start_date]
    if end_date:
        filtered = [l for l in filtered if l["created_at"][:10] <= end_date]
    
    filtered.sort(key=lambda x: x["created_at"], reverse=True)
    
    if format == "json":
        return StreamingResponse(
            io.BytesIO(json.dumps(filtered, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=leads_export.json"}
        )
    
    # CSV export
    output = io.StringIO()
    if filtered:
        writer = csv.DictWriter(output, fieldnames=filtered[0].keys())
        writer.writeheader()
        writer.writerows(filtered)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    global leads_db
    leads_db = [l for l in leads_db if l["id"] != lead_id]
    return {"success": True}

@api_router.get("/leads/stats")
async def get_lead_stats():
    total = len(leads_db)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = len([l for l in leads_db if l["created_at"][:10] == today])
    
    # Count by location
    locations = {}
    for l in leads_db:
        loc = l.get("location", "Unknown") or "Unknown"
        locations[loc] = locations.get(loc, 0) + 1
    
    # Count by investment interest
    interested = len([l for l in leads_db if l.get("investment_interest") == "Yes"])
    
    return {
        "total": total,
        "today": today_count,
        "interested": interested,
        "by_location": locations
    }


# ===== TRACKING PIXEL ENDPOINTS =====
@api_router.get("/pixels")
async def get_pixels():
    return {"pixels": pixels_db}

@api_router.get("/pixels/active")
async def get_active_pixels():
    """Returns only enabled pixels - used by the landing page to inject tracking codes"""
    active = [p for p in pixels_db if p.get("enabled", True)]
    return {"pixels": active}

@api_router.post("/pixels", response_model=TrackingPixel)
async def create_pixel(pixel_data: TrackingPixelCreate):
    pixel = TrackingPixel(**pixel_data.model_dump())
    pixels_db.append(pixel.model_dump())
    return pixel

@api_router.put("/pixels/{pixel_id}")
async def update_pixel(pixel_id: str, pixel_data: TrackingPixelUpdate):
    for i, p in enumerate(pixels_db):
        if p["id"] == pixel_id:
            update_data = {k: v for k, v in pixel_data.model_dump().items() if v is not None}
            pixels_db[i].update(update_data)
            return pixels_db[i]
    raise HTTPException(status_code=404, detail="Pixel not found")

@api_router.delete("/pixels/{pixel_id}")
async def delete_pixel(pixel_id: str):
    global pixels_db
    pixels_db = [p for p in pixels_db if p["id"] != pixel_id]
    return {"success": True}


# ===== CMS SETTINGS ENDPOINTS =====
@api_router.get("/settings/cms")
async def get_cms_settings():
    return settings_db

@api_router.put("/settings/cms")
async def update_cms_settings(settings: CMSSettings):
    global settings_db
    settings_db = settings.model_dump()
    return settings_db


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)