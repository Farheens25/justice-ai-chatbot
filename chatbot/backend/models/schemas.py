"""
Pydantic models for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional


class ComplaintRequest(BaseModel):
    """Request model for chatbot complaint"""
    complaint: str = Field(..., min_length=1, max_length=5000, description="User's complaint description")
    
    class Config:
        example = {"complaint": "I was scammed online"}


class ChatbotResponse(BaseModel):
    """Response model for chatbot"""
    success: bool
    error: Optional[str] = None
    category: Optional[str] = None
    response: Optional[dict] = None
    
    class Config:
        example = {
            "success": True,
            "error": None,
            "category": "Cyber Fraud",
            "response": {
                "section": "IT Act 66C, IPC 420",
                "advice": "File complaint at nearest Cyber Cell immediately...",
                "escalation": "If FIR not registered within 7 days, escalate to SP.",
                "helpline": "1930 (Cyber Crime Helpline)"
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str


class ChatRequest(BaseModel):
    """Request model for sending messages to GPT-like API"""
    messages: list[dict] = Field(
        ...,
        description="List of message objects {role: 'user'|'system'|'assistant', content: str}"
    )
    model: Optional[str] = Field(
        default="gpt-3.5-turbo",
        description="OpenAI model to use for chat"
    )

    class Config:
        example = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, who won the world series in 2020?"}
            ],
            "model": "gpt-3.5-turbo"
        }


class ChatResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    reply: Optional[str] = None

    class Config:
        example = {
            "success": True,
            "error": None,
            "reply": "The Los Angeles Dodgers won the 2020 World Series."
        }
