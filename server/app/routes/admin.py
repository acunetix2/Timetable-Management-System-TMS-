from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.dependencies import require_role
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])


def _serialize(value):
    if isinstance(value, ObjectId):
        return str(value)
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


# ==================== COLLEGE MANAGEMENT ====================

class CollegeCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    campus: Optional[str] = None


@router.post("/college", dependencies=[Depends(require_role("admin"))])
async def add_college(college: CollegeCreate):
    doc = college.dict()
    doc["created_at"] = datetime.utcnow()
    res = await db.colleges.insert_one(doc)
    return {"message": "College added", "id": str(res.inserted_id)}


@router.get("/colleges", dependencies=[Depends(require_role("admin"))])
async def list_colleges():
    cursor = db.colleges.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== DEPARTMENT MANAGEMENT ====================

class DepartmentCreate(BaseModel):
    code: str
    name: str
    college_id: str
    building_location: Optional[str] = None
    description: Optional[str] = None


@router.post("/department", dependencies=[Depends(require_role("admin"))])
async def add_department(dept: DepartmentCreate):
    # Verify college exists
    try:
        college_oid = ObjectId(dept.college_id)
        college = await db.colleges.find_one({"_id": college_oid})
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid college ID")
    
    doc = dept.dict()
    doc["college_id"] = college_oid
    doc["created_at"] = datetime.utcnow()
    res = await db.departments.insert_one(doc)
    return {"message": "Department added", "id": str(res.inserted_id)}


@router.get("/departments", dependencies=[Depends(require_role("admin"))])
async def list_departments():
    cursor = db.departments.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== ROOM MANAGEMENT ====================

class RoomCreate(BaseModel):
    code: str
    name: str
    capacity: int
    department_id: str
    building_location: Optional[str] = None
    house: Optional[str] = None  # House/Building identifier
    floor: Optional[int] = None
    room_type: Optional[str] = None


@router.post("/room", dependencies=[Depends(require_role("admin"))])
async def add_room(room: RoomCreate):
    # Verify department exists
    try:
        dept_oid = ObjectId(room.department_id)
        dept = await db.departments.find_one({"_id": dept_oid})
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid department ID")
    
    doc = room.dict()
    doc["department_id"] = dept_oid
    doc["is_available"] = True
    doc["created_at"] = datetime.utcnow()
    res = await db.rooms.insert_one(doc)
    return {"message": "Room added", "id": str(res.inserted_id)}


@router.get("/rooms", dependencies=[Depends(require_role("admin"))])
async def list_rooms():
    cursor = db.rooms.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


@router.get("/available-rooms", dependencies=[Depends(require_role("admin"))])
async def list_available_rooms():
    cursor = db.rooms.find({"is_available": True})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== COURSE MANAGEMENT ====================

class CourseCreate(BaseModel):
    code: str
    name: str
    department_id: str
    college_id: str
    duration_years: int = 3  # Default to 3 years if not provided
    room_id: Optional[str] = None
    color: Optional[str] = None


@router.post("/course", dependencies=[Depends(require_role("admin"))])
async def add_course(course: CourseCreate):
    try:
        doc = course.dict()
        # Ensure department_id is stored as string for filtering
        doc["department_id"] = str(course.department_id)
        doc["college_id"] = str(course.college_id)
        
        # Ensure duration_years is an integer
        try:
            doc["duration_years"] = int(course.duration_years)
        except (ValueError, TypeError):
            doc["duration_years"] = 3  # Default fallback
        
        if course.room_id:
            doc["room_id"] = str(course.room_id)
        doc["created_at"] = datetime.utcnow()
        doc["units"] = []  # Initialize empty units array
        res = await db.courses.insert_one(doc)
        return {"message": "Course added", "id": str(res.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating course: {str(e)}")


@router.post("/course/{course_id}/populate-units", dependencies=[Depends(require_role("admin"))])
async def populate_course_units(course_id: str, payload: dict):
    """Populate a course with units for all years"""
    try:
        course_oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    course = await db.courses.find_one({"_id": course_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    units = payload.get("units", [])  # List of {year, semester, code, name, credits, hours}
    
    for unit in units:
        unit_doc = {
            "_id": ObjectId(),
            "code": unit.get("code"),
            "name": unit.get("name"),
            "year": unit.get("year"),
            "semester": unit.get("semester"),
            "credits": unit.get("credits", 3),
            "total_hours": unit.get("total_hours", 45),
            "created_at": datetime.utcnow()
        }
        await db.courses.update_one(
            {"_id": course_oid},
            {"$push": {"units": unit_doc}}
        )
    
    updated = await db.courses.find_one({"_id": course_oid})
    return _serialize(updated)


@router.get("/courses", dependencies=[Depends(require_role("admin"))])
async def list_courses():
    cursor = db.courses.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


@router.put("/course/{course_id}/room", dependencies=[Depends(require_role("admin"))])
async def assign_room_to_course(course_id: str, payload: dict):
    """Assign a room to a course"""
    try:
        course_oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    room_id = payload.get("room_id")
    if not room_id:
        raise HTTPException(status_code=400, detail="Room ID required")
    
    # Verify course exists
    course = await db.courses.find_one({"_id": course_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update course with room
    result = await db.courses.update_one(
        {"_id": course_oid},
        {"$set": {"room_id": str(room_id), "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated = await db.courses.find_one({"_id": course_oid})
    return _serialize(updated)


# ==================== LECTURER ASSIGNMENT ====================

class LecturerAssignmentCreate(BaseModel):
    lecturer_id: str
    unit_id: str
    course_id: str
    department_id: str
    room_id: str
    suggested_time_slot_id: Optional[str] = None
    student_count: int = 0


@router.post("/assign-lecturer", dependencies=[Depends(require_role("admin"))])
async def assign_lecturer(assignment: LecturerAssignmentCreate):
    """Assign a lecturer to teach a unit"""
    # Verify all entities exist
    try:
        lecturer = await db.users.find_one({"_id": ObjectId(assignment.lecturer_id), "role": "lecturer"})
        if not lecturer:
            raise HTTPException(status_code=404, detail="Lecturer not found")
        
        course = await db.courses.find_one({"_id": ObjectId(assignment.course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        room = await db.rooms.find_one({"_id": ObjectId(assignment.room_id)})
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    doc = assignment.dict()
    doc["class_status"] = "pending"
    doc["created_at"] = datetime.utcnow()
    res = await db.lecturer_assignments.insert_one(doc)
    
    return {"message": "Lecturer assigned", "id": str(res.inserted_id)}


@router.get("/lecturer-assignments", dependencies=[Depends(require_role("admin"))])
async def list_lecturer_assignments():
    cursor = db.lecturer_assignments.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== LECTURER ID MANAGEMENT ====================

@router.post("/generate-lecturer-ids", dependencies=[Depends(require_role("admin"))])
async def generate_lecturer_ids(payload: dict):
    """Generate lecturer IDs for system"""
    count = payload.get("count", 10)
    ids = []
    
    for i in range(count):
        lecturer_id = f"LEC{str(uuid.uuid4()).split('-')[0].upper()}"
        doc = {
            "lecturer_id": lecturer_id,
            "claimed": False,
            "created_at": datetime.utcnow()
        }
        res = await db.lecturer_ids.insert_one(doc)
        ids.append({"id": str(res.inserted_id), "lecturer_id": lecturer_id})
    
    return {"message": f"Generated {count} lecturer IDs", "ids": ids}


@router.get("/available-lecturer-ids", dependencies=[Depends(require_role("admin"))])
async def get_available_lecturer_ids():
    cursor = db.lecturer_ids.find({"claimed": False})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return docs


# ==================== USER MANAGEMENT ====================

@router.get("/users", dependencies=[Depends(require_role("admin"))])
async def list_users():
    cursor = db.users.find({}, {"password": 0})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


@router.get("/users/{user_id}", dependencies=[Depends(require_role("admin"))])
async def get_user(user_id: str):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": oid}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return _serialize(user)


# ==================== TIME SLOT MANAGEMENT ====================

class TimeSlotCreate(BaseModel):
    day: str
    start_time: str
    end_time: str
    duration_hours: int
    semester: int
    academic_year: int


@router.post("/timeslot", dependencies=[Depends(require_role("admin"))])
async def add_timeslot(slot: TimeSlotCreate):
    doc = slot.dict()
    doc["created_at"] = datetime.utcnow()
    res = await db.timeslots.insert_one(doc)
    return {"message": "Time slot added", "id": str(res.inserted_id)}


@router.get("/timeslots", dependencies=[Depends(require_role("admin"))])
async def list_timeslots():
    cursor = db.timeslots.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== CLASS STATUS ====================

@router.put("/course/{course_id}/unit/{unit_id}/assign", dependencies=[Depends(require_role("admin"))])
async def assign_unit_to_lecturer(course_id: str, unit_id: str, payload: dict):
    """Assign a lecturer to a unit within a course"""
    try:
        course_oid = ObjectId(course_id)
        unit_oid = ObjectId(unit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course or unit ID")
    
    lecturer_email = payload.get("lecturerEmail")
    if not lecturer_email:
        raise HTTPException(status_code=400, detail="Lecturer email required")
    
    # Verify course exists
    course = await db.courses.find_one({"_id": course_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Verify lecturer exists
    lecturer = await db.users.find_one({"email": lecturer_email, "role": "lecturer"})
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    
    # Find the unit in the course
    unit = None
    if course.get("units"):
        for u in course["units"]:
            if str(u.get("_id")) == str(unit_oid):
                unit = u
                break
    
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found in course")
    
    # Update the unit with lecturer assignment
    result = await db.courses.update_one(
        {"_id": course_oid, "units._id": unit_oid},
        {"$set": {"units.$.lecturer": lecturer_email, "units.$.lecturer_id": str(lecturer["_id"]), "units.$.updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found in course")
    
    # Create a lecturer assignment record
    assignment_doc = {
        "lecturer_id": str(lecturer["_id"]),
        "course_id": str(course_oid),
        "unit_id": str(unit_oid),
        "department_id": str(course.get("department_id", "")),
        "room_id": "",  # To be assigned later or during scheduling
        "student_count": 0,
        "class_status": "pending",
        "created_at": datetime.utcnow()
    }
    
    # Check if assignment already exists
    existing = await db.lecturer_assignments.find_one({
        "lecturer_id": str(lecturer["_id"]),
        "unit_id": str(unit_oid),
        "course_id": str(course_oid)
    })
    
    if not existing:
        await db.lecturer_assignments.insert_one(assignment_doc)
    
    # Return updated course
    updated = await db.courses.find_one({"_id": course_oid})
    return _serialize(updated)


@router.put("/assignment/{assignment_id}/status", dependencies=[Depends(require_role("admin"))])
async def update_assignment_status(assignment_id: str, payload: dict):
    """Update class status: active, cancelled"""
    try:
        oid = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    status = payload.get("status")
    if status not in ["pending", "confirmed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.lecturer_assignments.update_one(
        {"_id": oid},
        {"$set": {"class_status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    updated = await db.lecturer_assignments.find_one({"_id": oid})
    return _serialize(updated)


# ==================== ADMIN ID MANAGEMENT ====================

@router.post("/generate-admin-ids", dependencies=[Depends(require_role("admin"))])
async def generate_admin_ids(payload: dict):
    """Generate admin IDs for system (super-admin only)"""
    count = payload.get("count", 5)
    ids = []
    
    for i in range(count):
        admin_id = f"ADM{str(uuid.uuid4()).split('-')[0].upper()}"
        doc = {
            "admin_id": admin_id,
            "claimed": False,
            "created_at": datetime.utcnow()
        }
        res = await db.admin_ids.insert_one(doc)
        ids.append({"id": str(res.inserted_id), "admin_id": admin_id})
    
    return {"message": f"Generated {count} admin IDs", "ids": ids}


@router.get("/available-admin-ids", dependencies=[Depends(require_role("admin"))])
async def get_available_admin_ids():
    """Get unclaimed admin IDs"""
    cursor = db.admin_ids.find({"claimed": False})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== MISSING CRUD ENDPOINTS ====================

@router.put("/room/{room_id}", dependencies=[Depends(require_role("admin"))])
async def update_room(room_id: str, payload: dict):
    """Update room details"""
    try:
        oid = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    
    room = await db.rooms.find_one({"_id": oid})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    update_data = {k: v for k, v in payload.items() if k in ["code", "name", "capacity", "building_location", "floor", "room_type", "is_available"]}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.rooms.update_one({"_id": oid}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    updated = await db.rooms.find_one({"_id": oid})
    return _serialize(updated)


@router.delete("/room/{room_id}", dependencies=[Depends(require_role("admin"))])
async def delete_room(room_id: str):
    """Delete a room"""
    try:
        oid = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid room ID")
    
    result = await db.rooms.delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"message": "Room deleted"}


@router.put("/course/{course_id}", dependencies=[Depends(require_role("admin"))])
async def update_course(course_id: str, payload: dict):
    """Update course details"""
    try:
        oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    course = await db.courses.find_one({"_id": oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = {k: v for k, v in payload.items() if k in ["code", "name", "department_id", "college_id", "duration_years", "color", "credits"]}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.courses.update_one({"_id": oid}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated = await db.courses.find_one({"_id": oid})
    return _serialize(updated)


@router.delete("/course/{course_id}", dependencies=[Depends(require_role("admin"))])
async def delete_course(course_id: str):
    """Delete a course"""
    try:
        oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    result = await db.courses.delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Course deleted"}


@router.post("/course/{course_id}/unit", dependencies=[Depends(require_role("admin"))])
async def add_unit_to_course(course_id: str, payload: dict):
    """Add a unit to a course"""
    try:
        course_oid = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")
    
    course = await db.courses.find_one({"_id": course_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    unit_doc = {
        "_id": ObjectId(),
        "code": payload.get("code", ""),
        "name": payload.get("name", ""),
        "year": payload.get("year", 1),
        "semester": payload.get("semester", 1),
        "credits": payload.get("credits", 3),
        "total_hours": payload.get("total_hours", 45),
        "created_at": datetime.utcnow()
    }
    
    result = await db.courses.update_one(
        {"_id": course_oid},
        {"$push": {"units": unit_doc}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated = await db.courses.find_one({"_id": course_oid})
    return _serialize(updated)


@router.get("/timetable", dependencies=[Depends(require_role("admin"))])
async def get_timetable():
    """Get all timetable entries"""
    cursor = db.timetables.find({})
    docs = []
    async for d in cursor:
        docs.append(_serialize(d))
    return {"data": docs}


# ==================== ROOM ASSIGNMENT ALGORITHM ====================

@router.post("/assign-rooms-to-units", dependencies=[Depends(require_role("admin"))])
async def assign_rooms_to_units():
    """
    Automatically assign rooms to all units based on:
    - Student enrollment count for each unit (room capacity >= enrollment)
    - First-fit algorithm: uses first available suitable room
    """
    try:
        # Get all courses with their units
        courses = []
        course_cursor = db.courses.find({})
        async for course in course_cursor:
            courses.append(_serialize(course))
        
        # Get all rooms
        rooms = []
        room_cursor = db.rooms.find({})
        async for room in room_cursor:
            rooms.append(_serialize(room))
        
        if not rooms:
            raise HTTPException(status_code=400, detail="No rooms available in the system")
        
        results = {
            "assigned": [],
            "failed": [],
            "total_units": 0
        }
        
        # Process each course and its units
        for course in courses:
            units = course.get("units", [])
            if not units:
                continue
            
            course_id_str = course["id"]
            
            for unit in units:
                unit_id = unit.get("_id") or unit.get("id")
                unit_code = unit.get("code", "Unknown")
                unit_name = unit.get("name", "Unknown")
                
                results["total_units"] += 1
                
                # Count students enrolled in this specific unit
                student_count = 0
                enrollment_cursor = db.student_enrollments.find({"course_id": course_id_str, "unit_ids": {"$in": [str(unit_id)]}})
                async for enrollment in enrollment_cursor:
                    student_count += 1
                
                if student_count == 0:
                    student_count = 1  # Default to 1 if no enrollments yet
                
                # Find suitable rooms (capacity >= student count)
                suitable_rooms = [
                    r for r in rooms 
                    if r.get("capacity", 0) >= student_count
                ]
                
                if not suitable_rooms:
                    results["failed"].append({
                        "course_id": course_id_str,
                        "course_name": course.get("name", "Unknown"),
                        "unit_id": str(unit_id),
                        "unit_code": unit_code,
                        "unit_name": unit_name,
                        "reason": f"No room with capacity >= {student_count} students"
                    })
                    continue
                
                # Use first-fit: assign the first suitable room
                assigned_room = suitable_rooms[0]
                
                # Update unit with room assignment (store room name, not ID)
                course_id_obj = ObjectId(course_id_str)
                unit_id_obj = ObjectId(unit_id) if isinstance(unit_id, str) else unit_id
                room_name = assigned_room.get("name", "")
                
                await db.courses.update_one(
                    {"_id": course_id_obj, "units._id": unit_id_obj},
                    {
                        "$set": {
                            "units.$.room": room_name,
                            "units.$.room_code": assigned_room.get("code", ""),
                            "units.$.assigned_at": datetime.utcnow()
                        }
                    }
                )
                
                results["assigned"].append({
                    "course_id": course_id_str,
                    "course_name": course.get("name", "Unknown"),
                    "unit_id": str(unit_id),
                    "unit_code": unit_code,
                    "unit_name": unit_name,
                    "room": room_name,
                    "room_code": assigned_room.get("code", ""),
                    "capacity": assigned_room.get("capacity", 0),
                    "students": student_count
                })
        
        return {
            "message": "Room assignment to units completed",
            "summary": {
                "total": results["total_units"],
                "assigned": len(results["assigned"]),
                "failed": len(results["failed"])
            },
            "details": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Room assignment failed: {str(e)}")

