from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Unit(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    lecturer_id: Optional[str] = None
    credits: Optional[int] = None
    total_hours: int = 45  # Default: 45 hours per semester
    year: int  # Year level (1, 2, 3, 4, etc.)
    semester: int  # 1 or 2
    created_at: Optional[datetime] = None


class Course(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    department_id: str
    college_id: str
    duration_years: int  # 3, 4, 5, or 6
    units: List[Unit] = Field(default_factory=list)
    color: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CourseEnrollment(BaseModel):
    id: Optional[str] = None
    student_id: str
    course_id: str
    enrollment_year: int
    semester: int
    enrolled_units: List[str] = Field(default_factory=list)  # List of unit IDs
    enrollment_date: Optional[datetime] = None

