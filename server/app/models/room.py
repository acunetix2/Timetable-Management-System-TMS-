from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Room(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    capacity: int
    department_id: str
    building_location: Optional[str] = None
    house: Optional[str] = None  # House/Building identifier (e.g., "Block A", "Building 1")
    floor: Optional[int] = None
    room_type: Optional[str] = None  # Lecture hall, Lab, Tutorial room, etc.
    is_available: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

