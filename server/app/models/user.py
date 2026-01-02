from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None
    role: str  # admin | lecturer | student
    name: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    notification_preferences: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class StudentProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    registration_number: str  # Format: XXX000-0000/YYYY
    department_id: Optional[str] = None
    course_id: Optional[str] = None
    college_id: Optional[str] = None
    campus: Optional[str] = None  # Main, CBD, etc.
    year: Optional[int] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    notification_preferences: Optional[dict] = None

class LecturerProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    lecturer_id: str  # Unique identifier assigned by admin
    department_id: str
    office_location: Optional[str] = None
    qualifications: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    notification_preferences: Optional[dict] = None

class AdminProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    admin_id: str
    permissions: list = []  # Permissions this admin has
    role_of_course: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    notification_preferences: Optional[dict] = None
