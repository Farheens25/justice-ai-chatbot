from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.chatbot_service import ChatbotService
from models.schemas import (
    ComplaintRequest,
    ChatbotResponse,
    HealthResponse,
    ChatRequest,
    ChatResponse,
)

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
