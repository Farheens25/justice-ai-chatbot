from pydantic import BaseModel

class ComplaintCreate(BaseModel):
    title: str
    description: str
    crime_type: str
    jurisdiction: str
    is_anonymous: bool = False