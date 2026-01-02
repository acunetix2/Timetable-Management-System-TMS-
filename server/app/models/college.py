from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class College(BaseModel):
    id: Optional[str] = None
    code: str
    name: str  # e.g., COPAS, COHES
    description: Optional[str] = None
    campus: Optional[str] = None
    created_at: Optional[datetime] = None


class Department(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    college_id: str
    building_location: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
