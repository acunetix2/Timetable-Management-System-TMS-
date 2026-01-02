from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.dependencies import require_role
from app.services.timetable_optimizer import TimetableGenerator, ClashDetector, ScheduleValidator
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/timetable", tags=["Timetable"])


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


@router.post("/generate", dependencies=[Depends(require_role("admin"))])
async def generate_timetable(payload: dict):
    """
    Generate clash-free timetable for a semester
    
    payload: {
        semester: int,
        academic_year: int,
        department_id: str (optional)
    }
    """
    semester = payload.get("semester")
    academic_year = payload.get("academic_year")
    department_id = payload.get("department_id")
    
    if not semester or not academic_year:
        raise HTTPException(status_code=400, detail="semester and academic_year required")
    
    # Fetch all assignments for this semester
    query = {
        "class_status": {"$in": ["pending", "confirmed"]}
    }
    if department_id:
        query["department_id"] = department_id
    
    assignments = []
    cursor = db.lecturer_assignments.find(query)
    async for assignment in cursor:
        assignments.append(_serialize(assignment))
    
    # Fetch available time slots
    timeslots = []
    slot_cursor = db.timeslots.find({
        "semester": semester,
        "academic_year": academic_year
    })
    async for slot in slot_cursor:
        timeslots.append(_serialize(slot))
    
    if not timeslots:
        raise HTTPException(status_code=400, detail="No time slots available for this semester")
    
    # Generate timetable
    generator = TimetableGenerator()
    result = generator.generate_timetable(assignments, timeslots)
    
    # Save generated timetable entries
    for entry in result["timetable"]:
        entry["semester"] = semester
        entry["academic_year"] = academic_year
        entry["generated_at"] = datetime.utcnow()
        await db.timetable_entries.insert_one(entry)
    
    return {
        "message": "Timetable generated successfully",
        "generated_entries": len(result["timetable"]),
        "clashes_detected": len(result["clashes"]),
        "unassigned": len(result["unassigned"]),
        "timetable": result["timetable"][:10],  # Return first 10 for preview
        "unassigned_assignments": result["unassigned"]
    }


@router.get("/clashes", dependencies=[Depends(require_role("admin"))])
async def detect_clashes(semester: int = 1, academic_year: int = 2024):
    """Detect all clashes in current timetable"""
    # Fetch all timetable entries for the semester
    timetable_entries = []
    cursor = db.timetable_entries.find({
        "semester": semester,
        "academic_year": academic_year,
        "status": "active"
    })
    async for entry in cursor:
        timetable_entries.append(_serialize(entry))
    
    # Detect clashes
    generator = TimetableGenerator()
    clashes = generator.detect_clashes(timetable_entries)
    
    return {
        "total_entries": len(timetable_entries),
        "clash_count": len(clashes),
        "clashes": clashes
    }


@router.post("/validate", dependencies=[Depends(require_role("admin"))])
async def validate_timetable(payload: dict):
    """Validate current timetable against constraints"""
    semester = payload.get("semester", 1)
    academic_year = payload.get("academic_year", 2024)
    
    # Fetch all timetable entries
    timetable = []
    cursor = db.timetable_entries.find({
        "semester": semester,
        "academic_year": academic_year
    })
    async for entry in cursor:
        timetable.append(_serialize(entry))
    
    # Validation checks
    errors = []
    warnings = []
    
    # Check for clashes
    generator = TimetableGenerator()
    clashes = generator.detect_clashes(timetable)
    if clashes:
        errors.append(f"Found {len(clashes)} class clashes")
    
    # Check room capacity
    for entry in timetable:
        room = await db.rooms.find_one({"_id": ObjectId(entry["room_id"])})
        assignment = await db.lecturer_assignments.find_one({"_id": ObjectId(entry["assignment_id"])})
        
        if room and assignment:
            student_count = assignment.get("student_count", 0)
            if student_count > room.get("capacity", 0):
                errors.append(
                    f"Room {room['name']} overcapacity: "
                    f"{student_count} students vs {room['capacity']} capacity"
                )
    
    # Check duration constraints
    for entry in timetable:
        assignment = await db.lecturer_assignments.find_one({"_id": ObjectId(entry["assignment_id"])})
        if assignment:
            # Validate 2 or 3 hour duration
            # This would require parsing start/end times
            pass
    
    return {
        "valid": len(errors) == 0,
        "total_entries": len(timetable),
        "errors": errors,
        "warnings": warnings
    }


@router.get("/stats", dependencies=[Depends(require_role("admin"))])
async def get_timetable_stats(semester: int = 1, academic_year: int = 2024):
    """Get statistics about the timetable"""
    # Total entries
    total_entries = await db.timetable_entries.count_documents({
        "semester": semester,
        "academic_year": academic_year
    })
    
    # Active classes
    active = await db.timetable_entries.count_documents({
        "semester": semester,
        "academic_year": academic_year,
        "status": "active"
    })
    
    # Cancelled classes
    cancelled = await db.timetable_entries.count_documents({
        "semester": semester,
        "academic_year": academic_year,
        "status": "cancelled"
    })
    
    # Lecturer assignments
    assignments = await db.lecturer_assignments.count_documents({
        "class_status": {"$in": ["pending", "confirmed"]}
    })
    
    # Confirmed classes
    confirmed = await db.lecturer_assignments.count_documents({
        "class_status": "confirmed"
    })
    
    # Detect clashes
    timetable_entries = []
    cursor = db.timetable_entries.find({
        "semester": semester,
        "academic_year": academic_year
    })
    async for entry in cursor:
        timetable_entries.append(_serialize(entry))
    
    generator = TimetableGenerator()
    clashes = generator.detect_clashes(timetable_entries)
    
    return {
        "semester": semester,
        "academic_year": academic_year,
        "total_timetable_entries": total_entries,
        "active_classes": active,
        "cancelled_classes": cancelled,
        "total_assignments": assignments,
        "confirmed_assignments": confirmed,
        "pending_assignments": assignments - confirmed,
        "clash_count": len(clashes)
    }
