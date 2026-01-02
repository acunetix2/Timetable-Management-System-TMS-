from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
from enum import Enum


class DayOfWeek(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


class TimeSlot(BaseModel):
    id: Optional[str] = None
    day: DayOfWeek
    start_time: time
    end_time: time
    duration_hours: int  # 2 or 3


class LecturerAssignment(BaseModel):
    id: Optional[str] = None
    lecturer_id: str
    unit_id: str
    course_id: str
    department_id: str
    room_id: str
    suggested_time_slot_id: Optional[str] = None
    confirmed_time_slot_id: Optional[str] = None
    student_count: int = 0
    class_status: str = "pending"  # pending, confirmed, cancelled
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TimetableEntry(BaseModel):
    id: Optional[str] = None
    student_id: Optional[str] = None
    lecturer_id: Optional[str] = None
    unit_id: str
    course_id: str
    room_id: str
    day: DayOfWeek
    start_time: time
    end_time: time
    status: str = "active"  # active, cancelled
    assignment_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AvailableTimeSlot(BaseModel):
    id: Optional[str] = None
    day: DayOfWeek
    start_time: time
    end_time: time
    is_booked: bool = False
    booked_by_lecturer_id: Optional[str] = None
    duration_hours: int
    created_at: Optional[datetime] = None

