from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.chatbot_service import ChatbotService
from models.schemas import (
    ComplaintRequest,
    ChatbotResponse,
    HealthResponse,
    ChatRequest,
    ChatResponse,
)
from schemas.complaint import ComplaintCreate

SUPABASE_FEATURES_ENABLED = False
supabase = None

try:
    from services.supabase_client import supabase as sb
    supabase = sb
    SUPABASE_FEATURES_ENABLED = True
except Exception:
    supabase = None

app = FastAPI(
    title="Justice AI",
    description="AI-powered legal guidance chatbot for Indian justice system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
def home():
    return {"status": "active", "message": "Justice AI Backend Running"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "healthy", "message": "Justice AI is operational"}


@app.post("/api/v1/chatbot/process", response_model=ChatbotResponse)
def process_complaint(request: ComplaintRequest):
    try:
        result = ChatbotService.process_complaint(request.complaint)
        return ChatbotResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing complaint: {str(e)}")


@app.get("/api/v1/chatbot/categories")
def get_categories():
    return {
        "categories": [
            "Cyber Fraud",
            "Harassment",
            "Domestic Violence",
            "Theft",
            "General Complaint",
        ]
    }


@app.post("/api/v1/chatbot/test")
def test_chatbot(request: ComplaintRequest):
    return process_complaint(request)


@app.post("/api/v1/chatbot/chat", response_model=ChatResponse)
def gpt_chat(request: ChatRequest):
    try:
        result = ChatbotService.chat_with_gpt(request.messages, request.model)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failure: {str(e)}")


class ComplaintStatusUpdate(BaseModel):
    status: str


@app.post("/create-complaint")
def create_complaint(complaint: ComplaintCreate, authorization: str = Header(default=None)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    strength_score, urgency_level = analyze_complaint(complaint.description)
    payload = {
        "title": complaint.title,
        "description": complaint.description,
        "crime_type": complaint.crime_type,
        "jurisdiction": complaint.jurisdiction,
        "is_anonymous": complaint.is_anonymous,
        "case_strength_score": strength_score,
        "urgency_level": urgency_level,
        "status": "submitted",
    }
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                payload["user_id"] = user_response.user.id
        except Exception:
            pass
    for field in ["name", "email", "phone", "location", "evidence"]:
        val = getattr(complaint, field, None)
        if val:
            payload[field] = val
    try:
        response = supabase.table("complaints").insert(payload).execute()
        return response.data
    except Exception:
        legacy_payload = {
            "name": complaint.name or "Anonymous",
            "phone": complaint.phone or "",
            "complaint": complaint.description,
        }
        response = supabase.table("complaints").insert(legacy_payload).execute()
        return response.data


@app.get("/complaints")
def list_complaints(status: str | None = None, limit: int = 100):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        query = supabase.table("complaints").select("*")
        if status and status.strip():
            query = query.eq("status", status.strip())
        result = query.limit(limit).execute()
        rows = result.data or []
        normalized = []
        for row in rows:
            description = row.get("description") or row.get("complaint") or ""
            normalized.append(
                {
                    "id": row.get("id"),
                    "title": row.get("title") or (description[:60] + ("..." if len(description) > 60 else "")),
                    "description": description,
                    "crime_type": row.get("crime_type") or "General Complaint",
                    "jurisdiction": row.get("jurisdiction") or row.get("location") or "Not specified",
                    "status": row.get("status") or "submitted",
                    "created_at": row.get("created_at"),
                    "name": row.get("name"),
                    "email": row.get("email"),
                    "phone": row.get("phone"),
                    "location": row.get("location"),
                    "evidence": row.get("evidence"),
                    "urgency_level": row.get("urgency_level") or "low",
                }
            )
        return {"data": normalized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch complaints: {str(e)}")


@app.patch("/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, request: ComplaintStatusUpdate):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        result = (
            supabase.table("complaints")
            .update({"status": request.status})
            .eq("id", complaint_id)
            .execute()
        )
        return {"data": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update complaint status: {str(e)}")


def analyze_complaint(description: str):
    description = description.lower()
    strong_keywords = ["bribe", "corruption", "violence", "threat", "harassment"]
    urgent_keywords = ["immediately", "urgent", "life", "danger", "threat"]

    strength_score = 50
    urgency_level = "low"

    for word in strong_keywords:
        if word in description:
            strength_score += 10

    for word in urgent_keywords:
        if word in description:
            urgency_level = "high"

    return min(strength_score, 100), urgency_level
