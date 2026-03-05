from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from schemas.complaint import ComplaintCreate
from services.supabase_client import supabase
from pydantic import BaseModel
from services.chatbot_service import ChatbotService
from models.schemas import ComplaintRequest, ChatbotResponse, HealthResponse, ChatRequest, ChatResponse

app = FastAPI(
    title="Justice AI",
    description="AI-powered legal guidance chatbot for Indian justice system",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthResponse)
def home():
    """Home endpoint"""
    return {
        "status": "active",
        "message": "Justice AI Backend Running"
    }


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Justice AI is operational"
    }


@app.post("/api/v1/chatbot/process", response_model=ChatbotResponse)
def process_complaint(request: ComplaintRequest):
    """
    Process user complaint and get legal guidance
    
    **Request body:**
    - complaint (str): Description of the legal issue
    
    **Returns:**
    - success (bool): Whether processing was successful
    - category (str): Detected complaint category
    - response (dict): Legal guidance with section, advice, escalation path, and helpline
    """
    try:
        result = ChatbotService.process_complaint(request.complaint)
        return ChatbotResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing complaint: {str(e)}")


@app.get("/api/v1/chatbot/categories")
def get_categories():
    """Get list of all complaint categories"""
    return {
        "categories": [
            "Cyber Fraud",
            "Harassment",
            "Domestic Violence",
            "Theft",
            "General Complaint"
        ]
    }


@app.post("/api/v1/chatbot/test")
def test_chatbot(request: ComplaintRequest):
    """Test endpoint for chatbot (same as /process but for testing)"""
    return process_complaint(request)


# ------ GPT Chat Endpoint --------------------------------------------------
from models.schemas import ChatRequest, ChatResponse

@app.post("/api/v1/chatbot/chat", response_model=ChatResponse)
def gpt_chat(request: ChatRequest):
    """
    Proxy a chat session to an OpenAI-compatible ChatCompletion API.

    The request body should include a list of message objects with roles and
    content (following OpenAI format). An API key must be provided via the
    OPENAI_API_KEY environment variable.
    
    Example:
    {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user",   "content": "Hello!"}
        ],
        "model": "gpt-3.5-turbo"
    }
    """
    try:
        result = ChatbotService.chat_with_gpt(request.messages, request.model)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failure: {str(e)}")

# Include chat router
app.include_router(chat_router)

# Home route
@app.get("/")
def home():
    return {"message": "Justice AI Backend Running"}

# Test DB
@app.get("/test-db")
def test_db():
    response = supabase.table("profiles").select("*").execute()
    return response.data
@app.post("/create-complaint")
def create_complaint(
    complaint: ComplaintCreate,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.split(" ")[1]
    user_response = supabase.auth.get_user(token)
    user = user_response.user

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 🔥 AI analysis happens here
    strength_score, urgency_level = analyze_complaint(complaint.description)

    response = supabase.table("complaints").insert({
        "user_id": user.id,
        "title": complaint.title,
        "description": complaint.description,
        "crime_type": complaint.crime_type,
        "jurisdiction": complaint.jurisdiction,
        "is_anonymous": complaint.is_anonymous,
        "case_strength_score": strength_score,
        "urgency_level": urgency_level,
        "status": "submitted"
    }).execute()

    return response.data
# LoginRequest model
class LoginRequest(BaseModel):
    email: str
    password: str

# Signup route (fixed, no duplicates)
@app.post("/signup-test")
def signup_test(data: LoginRequest):
    try:
        response = supabase.auth.sign_up(
            {
                "email": data.email,
                "password": data.password,
            }
        )
        return {"status": "success", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")

# Login route
@app.post("/login-test")
def login_test(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": data.email,
                "password": data.password,
            }
        )
        return {"status": "success", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")
def analyze_complaint(description: str):

    description = description.lower()

    # Simple keyword-based scoring
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

    # Cap strength score at 100
    strength_score = min(strength_score, 100)

    return strength_score, urgency_level    
@app.get("/my-complaints")
def get_my_complaints(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.split(" ")[1]

    # Get logged-in user from Supabase
    user_response = supabase.auth.get_user(token)
    user = user_response.user

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch complaints for this user only
    response = supabase.table("complaints") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()

    return response.data
