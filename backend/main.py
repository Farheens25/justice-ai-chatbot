from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
