from pydantic import BaseModel
from typing import Optional
from datetime import time, datetime


class TimeSlot(BaseModel):
    id: Optional[str] = None
    day: str  # Monday, Tuesday, etc.
    start_time: time
    end_time: time
    duration_hours: int  # 2 or 3
    semester: int
    academic_year: int
    created_at: Optional[datetime] = None

