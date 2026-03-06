from typing import Optional

from pydantic import BaseModel

class ComplaintCreate(BaseModel):
    title: str
    description: str
    crime_type: str
    jurisdiction: str
    is_anonymous: bool = False
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    evidence: Optional[str] = None
