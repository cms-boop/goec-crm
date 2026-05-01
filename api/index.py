from fastapi import FastAPI, APIRouter, Query, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
import csv
import io
from starlette.responses import StreamingResponse

from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.orm import sessionmaker, Session, declarative_base

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import requests

# ===== DATABASE CONFIGURATION =====
# Make sure to set DATABASE_URL in your .env file
# Defaults to sqlite for local dev if not provided
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_dev.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===== DB MODELS =====
class DBLead(Base):
    __tablename__ = "leads"
    id = Column(String, primary_key=True, index=True)
    investment_interest = Column(String, default="")
    own_land = Column(String, default="")
    location = Column(String, default="")
    site_visit = Column(String, default="")
    name = Column(String, default="")
    phone = Column(String, default="")
    city = Column(String, default="")
    email = Column(String, default="")
    created_at = Column(String, default="")

class DBSettings(Base):
    __tablename__ = "settings"
    id = Column(String, primary_key=True, index=True, default="1")
    cms_webhook_url = Column(String, default="")
    cms_api_key = Column(String, default="")
    cms_enabled = Column(Boolean, default=False)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# In-memory mock variables for unmigrated features
pixels_db = []

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===== PYDANTIC MODELS =====
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
    return {"message": "GO EC API with AWS RDS/Local DB"}

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**lead_data.model_dump())
    
    # Store in DB
    try:
        db_lead = DBLead(**lead.model_dump())
        db.add(db_lead)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to save to Database: {e}")
        db.rollback()
        # Proceed even if DB fails (fallback behavior)
    
    # CMS Webhook logic
    try:
        settings = db.query(DBSettings).filter(DBSettings.id == "1").first()
        if settings and settings.cms_enabled and settings.cms_webhook_url:
            url = settings.cms_webhook_url
            hook_headers = {"Content-Type": "application/json"}
            if settings.cms_api_key:
                hook_headers["Authorization"] = settings.cms_api_key
            requests.post(url, json=lead.model_dump(), headers=hook_headers, timeout=5)
    except Exception as e:
        logger.error(f"CMS Webhook failure: {e}")

    return lead

@api_router.get("/leads")
async def get_leads(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(DBLead)
        if start_date:
            query = query.filter(DBLead.created_at >= start_date)
        if end_date:
            query = query.filter(DBLead.created_at <= end_date)
            
        leads = query.order_by(DBLead.created_at.desc()).all()
        filtered = [
            {column.name: getattr(lead, column.name) for column in DBLead.__table__.columns}
            for lead in leads
        ]
    except Exception as e:
        logger.error(f"Database GET error: {e}")
        filtered = []

    if search:
        search_lower = search.lower()
        filtered = [l for l in filtered if (
            search_lower in l.get("name", "").lower() or
            search_lower in l.get("email", "").lower() or
            search_lower in l.get("phone", "").lower() or
            search_lower in l.get("city", "").lower()
        )]
    
    return {"leads": filtered, "total": len(filtered)}

@api_router.get("/leads/export")
async def export_leads(format: str = Query("csv"), db: Session = Depends(get_db)):
    try:
        leads = db.query(DBLead).order_by(DBLead.created_at.desc()).all()
        filtered = [
            {column.name: getattr(lead, column.name) for column in DBLead.__table__.columns}
            for lead in leads
        ]
    except:
        filtered = []
    
    if format == "json":
        return StreamingResponse(
            io.BytesIO(json.dumps(filtered, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=leads_export.json"}
        )
    
    output = io.StringIO()
    if filtered:
        writer = csv.DictWriter(output, fieldnames=filtered[0].keys())
        writer.writeheader()
        writer.writerows(filtered)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    try:
        lead = db.query(DBLead).filter(DBLead.id == lead_id).first()
        if lead:
            db.delete(lead)
            db.commit()
    except Exception as e:
        logger.error(f"Failed to delete lead: {e}")
        db.rollback()
    return {"success": True}

@api_router.get("/leads/stats")
async def get_lead_stats(db: Session = Depends(get_db)):
    try:
        leads = db.query(DBLead).all()
        leads_data = [
            {column.name: getattr(lead, column.name) for column in DBLead.__table__.columns}
            for lead in leads
        ]
    except:
        leads_data = []
        
    total = len(leads_data)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = len([l for l in leads_data if l.get("created_at", "")[:10] == today])
    locations = {}
    for l in leads_data:
        loc = l.get("location", "Unknown") or "Unknown"
        locations[loc] = locations.get(loc, 0) + 1
    interested = len([l for l in leads_data if l.get("investment_interest") == "Yes"])
    
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
async def get_cms_settings(db: Session = Depends(get_db)):
    settings = db.query(DBSettings).filter(DBSettings.id == "1").first()
    if not settings:
        settings = DBSettings(id="1")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "cms_webhook_url": settings.cms_webhook_url,
        "cms_api_key": settings.cms_api_key,
        "cms_enabled": settings.cms_enabled
    }

@api_router.put("/settings/cms")
async def update_cms_settings(settings_data: CMSSettings, db: Session = Depends(get_db)):
    settings = db.query(DBSettings).filter(DBSettings.id == "1").first()
    if not settings:
        settings = DBSettings(id="1")
        db.add(settings)
    
    settings.cms_webhook_url = settings_data.cms_webhook_url
    settings.cms_api_key = settings_data.cms_api_key
    settings.cms_enabled = settings_data.cms_enabled
    
    db.commit()
    return settings_data.model_dump()


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