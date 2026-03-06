from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.ai_service import generate_legal_response
from dependencies.roles import require_role

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_with_ai(
    request: ChatRequest,
    user=Depends(require_role(["police", "lawyer"]))
):
    reply = generate_legal_response(request.message)
    return {"response": reply}