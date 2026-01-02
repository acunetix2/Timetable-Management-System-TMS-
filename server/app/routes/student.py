from fastapi import APIRouter, Depends, Header, HTTPException
from app.database import db
from app.security import decode_token
from bson import ObjectId
from app.dependencies import require_role
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/student", tags=["Student"])


def _serialize(value):
    if isinstance(value, ObjectId):
        return str(value)
    from datetime import datetime
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        new = {}
        for k, v in value.items():
            if k == "_id":
                new["id"] = _serialize(v)
            else:
                new[k] = _serialize(v)
        return new
    if isinstance(value, list):
        return [_serialize(v) for v in value]
    return value


async def get_current_student(authorization: str = Header(None)):
    """Get current student from token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = decode_token(token)
    email = payload.get("email")
    
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email, "role": "student"})
    if not user:
        raise HTTPException(status_code=401, detail="Student not found")
    
    return _serialize(user)


class EnrollmentModel(BaseModel):
    unit_ids: List[str] = []


@router.get("/timetable", dependencies=[Depends(require_role("student"))])
async def view_timetable(authorization: str = Header(None)):
    """Get student's timetable"""
    student = await get_current_student(authorization)
    
    # Find student's enrollments
    enrollments = []
    cursor = db.student_enrollments.find({"student": student["email"]})
    async for enrollment in cursor:
        enrollments.append(_serialize(enrollment))
    
    # Get timetable entries for enrolled courses
    timetable = []
    for enrollment in enrollments:
        tt_cursor = db.timetable_entries.find({"course_id": enrollment.get("course_id")})
        async for entry in tt_cursor:
            timetable.append(_serialize(entry))
    
    return {"data": timetable if timetable else []}


@router.post("/enroll/{course_id}", dependencies=[Depends(require_role("student"))])
async def enroll(
    course_id: str,
    enrollment: EnrollmentModel,
    authorization: str = Header(None)
):
    """Enroll student in a course with selected units"""
    student = await get_current_student(authorization)
    
    try:
        course_oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    # Ensure course_id is stored as string for consistency
    course_id_str = str(course_oid)
    
    # Verify course exists
    course = await db.courses.find_one({"_id": course_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if student is already enrolled in another course
    existing = await db.student_enrollments.find_one({"student": student["email"]})
    if existing and str(existing.get("course_id")) != course_id_str:
        raise HTTPException(
            status_code=400,
            detail="Student already enrolled in another course. Withdraw first."
        )
    
    # Store enrollment with consistent course_id format
    from datetime import datetime
    enrollment_doc = {
        "student": student["email"],
        "student_id": student["id"],
        "course_id": course_id_str,
        "unit_ids": enrollment.unit_ids,
        "created_at": datetime.utcnow()
    }
    
    # Delete any old enrollment for this student in this course first to avoid duplicates
    await db.student_enrollments.delete_many({
        "student": student["email"],
        "course_id": course_id_str
    })
    
    # Insert fresh enrollment document
    result = await db.student_enrollments.insert_one(enrollment_doc)
    
    # Add student to course's student list
    await db.courses.update_one(
        {"_id": course_oid},
        {"$addToSet": {"students": student["email"]}}
    )
    
    # Update student count in course - count all students enrolled
    student_count = await db.student_enrollments.count_documents({"course_id": course_id_str})
    await db.courses.update_one(
        {"_id": course_oid},
        {"$set": {"student_count": student_count}}
    )
    
    return {
        "message": "Enrolled successfully",
        "course_id": course_id_str,
        "unit_ids": enrollment.unit_ids,
        "student_count": student_count
    }


@router.get("/enrollments", dependencies=[Depends(require_role("student"))])
async def get_enrollments(authorization: str = Header(None)):
    """Get student's course enrollments with course details"""
    student = await get_current_student(authorization)
    
    enrollments = []
    cursor = db.student_enrollments.find({"student": student["email"]})
    async for enrollment in cursor:
        enrollment_data = _serialize(enrollment)
        
        # Fetch course details
        try:
            course_id_obj = ObjectId(enrollment_data.get("course_id"))
            course = await db.courses.find_one({"_id": course_id_obj})
            if course:
                course_data = _serialize(course)
                enrollment_data["course_code"] = course_data.get("code", "")
                enrollment_data["course_name"] = course_data.get("name", "")
                # Count actual units the student enrolled in
                unit_count = len(enrollment_data.get("unit_ids", []))
                enrollment_data["unit_count"] = unit_count
        except Exception as e:
            print(f"Error fetching course details: {e}")
        
        enrollments.append(enrollment_data)
    
    return {"data": enrollments}


@router.get("/courses", dependencies=[Depends(require_role("student"))])
async def get_available_courses(authorization: str = Header(None)):
    """Get all available courses for enrollment"""
    student = await get_current_student(authorization)
    
    courses = []
    cursor = db.courses.find({})
    async for course in cursor:
        courses.append(_serialize(course))
    
    return {"data": courses}


@router.get("/departments", dependencies=[Depends(require_role("student"))])
async def get_departments(authorization: str = Header(None)):
    """Get all departments"""
    student = await get_current_student(authorization)
    
    departments = []
    cursor = db.departments.find({})
    async for dept in cursor:
        departments.append(_serialize(dept))
    
    return {"data": departments}
