from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import db
from app.dependencies import require_role
from app.security import decode_token
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/lecturer", tags=["Lecturer"])


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


async def get_current_lecturer(authorization: str = Header(None)):
    """Get current lecturer from token"""
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
    
    user = await db.users.find_one({"email": email, "role": "lecturer"})
    if not user:
        raise HTTPException(status_code=401, detail="Lecturer not found")
    
    return _serialize(user)


# ==================== ASSIGNMENTS ====================

@router.get("/assignments", dependencies=[Depends(require_role("lecturer"))])
async def get_assignments(authorization: str = Header(None)):
    """Get all assignments for lecturer"""
    lecturer = await get_current_lecturer(authorization)
    
    cursor = db.lecturer_assignments.find({"lecturer_id": lecturer["id"]})
    assignments = []
    async for assignment in cursor:
        serialized = _serialize(assignment)
        
        # Fetch course and unit names to display instead of IDs
        try:
            course_id = assignment.get("course_id")
            unit_id = assignment.get("unit_id")
            
            if course_id:
                try:
                    course_oid = ObjectId(course_id)
                    course = await db.courses.find_one({"_id": course_oid})
                    if course:
                        serialized["course_name"] = course.get("name", "Unknown Course")
                        serialized["course_code"] = course.get("code", "")
                        # Include student count for the course
                        serialized["student_count"] = course.get("student_count", 0)
                        
                        # Find unit name within course units
                        if unit_id and course.get("units"):
                            try:
                                unit_oid = ObjectId(unit_id)
                                for unit in course["units"]:
                                    if unit.get("_id") == unit_oid:
                                        serialized["unit_name"] = unit.get("name", "Unknown Unit")
                                        serialized["unit_code"] = unit.get("code", "")
                                        break
                            except:
                                pass
                except:
                    pass
        except:
            pass
        
        assignments.append(serialized)
    
    return {"data": assignments}


@router.get("/assignments/{assignment_id}", dependencies=[Depends(require_role("lecturer"))])
async def get_assignment_detail(
    assignment_id: str,
    authorization: str = Header(None)
):
    """Get assignment details with full information"""
    lecturer = await get_current_lecturer(authorization)
    
    try:
        oid = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    assignment = await db.lecturer_assignments.find_one({
        "_id": oid,
        "lecturer_id": lecturer["id"]
    })
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    serialized = _serialize(assignment)
    
    # Fetch course and unit names
    try:
        course_id = assignment.get("course_id")
        unit_id = assignment.get("unit_id")
        
        if course_id:
            try:
                course_oid = ObjectId(course_id)
                course = await db.courses.find_one({"_id": course_oid})
                if course:
                    serialized["course_name"] = course.get("name", "Unknown Course")
                    serialized["course_code"] = course.get("code", "")
                    # Include student count for the course
                    serialized["student_count"] = course.get("student_count", 0)
                    
                    # Find unit name within course units
                    if unit_id and course.get("units"):
                        try:
                            unit_oid = ObjectId(unit_id)
                            for unit in course["units"]:
                                if unit.get("_id") == unit_oid:
                                    serialized["unit_name"] = unit.get("name", "Unknown Unit")
                                    serialized["unit_code"] = unit.get("code", "")
                                    break
                        except:
                            pass
            except:
                pass
    except:
        pass
    
    return serialized


# ==================== AVAILABILITY & TIME SLOT SELECTION ====================

class TimeSlotPreference(BaseModel):
    assignment_id: str
    day: str
    start_time: str
    end_time: str


@router.get("/available-slots/{assignment_id}", dependencies=[Depends(require_role("lecturer"))])
async def get_available_slots(
    assignment_id: str,
    authorization: str = Header(None)
):
    """
    Get available time slots for an assignment (7 AM - 7 PM).
    Provides both 2-hour and 3-hour lecture options.
    Limits to maximum 2 selections per unit per week.
    """
    lecturer = await get_current_lecturer(authorization)
    
    try:
        oid = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    assignment = await db.lecturer_assignments.find_one({
        "_id": oid,
        "lecturer_id": lecturer["id"]
    })
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Count how many slots are already selected for this unit
    unit_id = assignment.get("unit_id")
    selected_count = await db.timetable_entries.count_documents({
        "unit_id": unit_id,
        "lecturer_id": lecturer["id"]
    })
    
    # Define days and time slots
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    # 2-hour lecture slots: 7-9, 9-11, 11-1, 1-3, 3-5, 5-7
    slots_2hr = [
        {"start": "07:00", "end": "09:00", "display": "7:00 AM - 9:00 AM"},
        {"start": "09:00", "end": "11:00", "display": "9:00 AM - 11:00 AM"},
        {"start": "11:00", "end": "13:00", "display": "11:00 AM - 1:00 PM"},
        {"start": "13:00", "end": "15:00", "display": "1:00 PM - 3:00 PM"},
        {"start": "15:00", "end": "17:00", "display": "3:00 PM - 5:00 PM"},
        {"start": "17:00", "end": "19:00", "display": "5:00 PM - 7:00 PM"},
    ]
    
    # 3-hour lecture slots: 7-10, 10-1, 1-4, 4-7
    slots_3hr = [
        {"start": "07:00", "end": "10:00", "display": "7:00 AM - 10:00 AM"},
        {"start": "10:00", "end": "13:00", "display": "10:00 AM - 1:00 PM"},
        {"start": "13:00", "end": "16:00", "display": "1:00 PM - 4:00 PM"},
        {"start": "16:00", "end": "19:00", "display": "4:00 PM - 7:00 PM"},
    ]
    
    # Generate all available slots for the week with duration options
    all_slots = []
    for day in days:
        # Add 2-hour slots
        for slot in slots_2hr:
            all_slots.append({
                "day": day,
                "start_time": slot["start"],
                "end_time": slot["end"],
                "display": slot["display"],
                "duration": "2 hours"
            })
        # Add 3-hour slots
        for slot in slots_3hr:
            all_slots.append({
                "day": day,
                "start_time": slot["start"],
                "end_time": slot["end"],
                "display": slot["display"],
                "duration": "3 hours"
            })
    
    # Get booked slots (confirmed timetable entries)
    booked_slots = []
    timetable_cursor = db.timetable_entries.find({})
    async for entry in timetable_cursor:
        booked_slots.append(_serialize(entry))
    
    # Get all slots already selected by this lecturer for this unit
    lecturer_slots = await db.timetable_entries.find({"unit_id": unit_id, "lecturer_id": lecturer["id"]}).to_list(None)
    lecturer_selected_slots = [_serialize(slot) for slot in lecturer_slots]
    
    # Mark availability
    available_slots = []
    can_select_more = selected_count < 2  # Max 2 selections per unit
    
    for slot in all_slots:
        # Check if slot is booked by any lecturer (but not by this lecturer for same unit)
        is_booked = any(
            ts["day"] == slot["day"] and
            ts["start_time"] == slot["start_time"] and
            ts["end_time"] == slot["end_time"] and
            ts.get("unit_id") != unit_id  # Only blocked if booked by different unit
            for ts in booked_slots
        )
        
        # Check if this assignment already has selected this exact slot
        is_already_selected = any(
            ts["day"] == slot["day"] and
            ts["start_time"] == slot["start_time"] and
            ts["end_time"] == slot["end_time"]
            for ts in lecturer_selected_slots
        )
        
        # Determine status
        if is_already_selected:
            status = "selected"
        elif is_booked:
            status = "red"
        elif not can_select_more:
            status = "disabled"  # Reached max 2 selections
        else:
            status = "green"
        
        available_slots.append({
            **slot,
            "is_booked": is_booked,
            "is_selected": is_already_selected,
            "status": status,
            "selected_count": selected_count,
            "can_select_more": can_select_more
        })
    
    return {"data": available_slots}


@router.post("/select-time-slot", dependencies=[Depends(require_role("lecturer"))])
async def select_time_slot(
    preference: TimeSlotPreference,
    authorization: str = Header(None)
):
    """Lecturer selects a time slot for their class"""
    lecturer = await get_current_lecturer(authorization)
    
    try:
        assignment_oid = ObjectId(preference.assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    assignment = await db.lecturer_assignments.find_one({
        "_id": assignment_oid,
        "lecturer_id": lecturer["id"]
    })
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if slot is already booked
    existing_entry = await db.timetable_entries.find_one({
        "day": preference.day,
        "start_time": preference.start_time,
        "end_time": preference.end_time
    })
    
    if existing_entry:
        raise HTTPException(status_code=409, detail="Time slot already booked")
    
    # Create timetable entry
    entry = {
        "assignment_id": str(assignment_oid),
        "lecturer_id": lecturer["id"],
        "unit_id": assignment["unit_id"],
        "course_id": assignment["course_id"],
        "room_id": assignment["room_id"],
        "day": preference.day,
        "start_time": preference.start_time,
        "end_time": preference.end_time,
        "status": "active",
        "created_at": datetime.utcnow()
    }
    
    res = await db.timetable_entries.insert_one(entry)
    
    # Update assignment
    await db.lecturer_assignments.update_one(
        {"_id": assignment_oid},
        {
            "$set": {
                "confirmed_time_slot_id": str(res.inserted_id),
                "class_status": "confirmed",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Time slot selected successfully",
        "entry_id": str(res.inserted_id)
    }


@router.put("/update-availability/{assignment_id}", dependencies=[Depends(require_role("lecturer"))])
async def update_availability(
    assignment_id: str,
    payload: dict,
    authorization: str = Header(None)
):
    """
    Lecturer updates availability by unselecting a timeframe.
    This triggers timetable regeneration.
    """
    lecturer = await get_current_lecturer(authorization)
    
    try:
        assignment_oid = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    assignment = await db.lecturer_assignments.find_one({
        "_id": assignment_oid,
        "lecturer_id": lecturer["id"]
    })
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Remove the timetable entry
    confirmed_slot_id = assignment.get("confirmed_time_slot_id")
    if confirmed_slot_id:
        try:
            slot_oid = ObjectId(confirmed_slot_id)
            await db.timetable_entries.delete_one({"_id": slot_oid})
        except Exception:
            pass
    
    # Update assignment status back to pending
    await db.lecturer_assignments.update_one(
        {"_id": assignment_oid},
        {
            "$set": {
                "confirmed_time_slot_id": None,
                "class_status": "pending",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Notify system to regenerate timetable
    # This will be handled by admin endpoint
    
    return {"message": "Availability updated. Timetable will be regenerated."}


# ==================== TIME SLOT SELECTION ====================

class TimeSlotSelection(BaseModel):
    assignment_id: str
    day: str
    start_time: str
    end_time: str


@router.post("/select-time-slot", dependencies=[Depends(require_role("lecturer"))])
async def select_time_slot(
    data: TimeSlotSelection,
    authorization: str = Header(None)
):
    """Lecturer selects time slots for their assignment (max 2 per week)"""
    lecturer = await get_current_lecturer(authorization)
    
    try:
        assignment_oid = ObjectId(data.assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
    
    # Fetch the assignment
    assignment = await db.lecturer_assignments.find_one({
        "_id": assignment_oid,
        "lecturer_id": lecturer["id"]
    })
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Count existing timetable entries for this assignment
    existing_entries = list(await db.timetable_entries.find({
        "assignment_id": str(assignment_oid)
    }).to_list(length=None))
    
    if len(existing_entries) >= 2:
        raise HTTPException(
            status_code=400,
            detail="Maximum 2 time slots per unit per week. You have already selected 2 slots."
        )
    
    # Check if this exact slot is already booked by another lecturer
    slot_conflict = await db.timetable_entries.find_one({
        "day": data.day,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "assignment_id": {"$ne": str(assignment_oid)}
    })
    
    if slot_conflict:
        raise HTTPException(
            status_code=400,
            detail=f"Time slot {data.day} {data.start_time}-{data.end_time} is already booked by another lecturer"
        )
    
    # Fetch course and unit details
    try:
        course_oid = ObjectId(assignment.get("course_id"))
        course = await db.courses.find_one({"_id": course_oid})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching course: {str(e)}")
    
    # Fetch room details including house information
    room_house = ""
    if assignment.get("room"):
        try:
            # Try to find room by name in the database
            room_doc = await db.rooms.find_one({"name": assignment.get("room")})
            if room_doc:
                room_house = room_doc.get("house", "")
        except Exception:
            pass
    
    # Create timetable entry for this assignment
    timetable_entry = {
        "assignment_id": str(assignment_oid),
        "lecturer_id": lecturer["id"],
        "lecturer_name": lecturer.get("name", ""),
        "course_id": str(assignment.get("course_id")),
        "course_code": course.get("code", ""),
        "course_name": course.get("name", ""),
        "unit_id": str(assignment.get("unit_id")),
        "unit_code": assignment.get("unit_code", ""),
        "unit_name": assignment.get("unit_name", ""),
        "day": data.day,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "duration": "2 hours" if int(data.end_time.split(':')[0]) - int(data.start_time.split(':')[0]) == 2 else "3 hours",
        "room": assignment.get("room", "TBA"),
        "room_code": assignment.get("room_code", ""),
        "room_house": room_house,  # Add house information
        "student_count": assignment.get("student_count", 0),
        "created_at": datetime.utcnow(),
        "status": "confirmed"
    }
    
    # Insert timetable entry
    result = await db.timetable_entries.insert_one(timetable_entry)
    
    # Check if we have 2 slots now - if yes, mark assignment as fully confirmed
    all_entries = list(await db.timetable_entries.find({
        "assignment_id": str(assignment_oid)
    }).to_list(length=None))
    
    update_data = {
        "timetable_entry_ids": [str(e["_id"]) for e in all_entries],
        "updated_at": datetime.utcnow()
    }
    
    # Mark as confirmed only when 2 slots are selected
    if len(all_entries) >= 2:
        update_data["class_status"] = "confirmed"
    
    await db.lecturer_assignments.update_one(
        {"_id": assignment_oid},
        {"$set": update_data}
    )
    
    return {
        "message": "Time slot selected successfully",
        "timetable_entry_id": str(result.inserted_id),
        "assignment_id": str(assignment_oid),
        "slots_selected": len(all_entries),
        "max_slots": 2,
        "status": "fully_confirmed" if len(all_entries) >= 2 else "partially_confirmed",
        "day": data.day,
        "start_time": data.start_time,
        "end_time": data.end_time
    }


# ==================== DASHBOARD ====================

@router.get("/dashboard", dependencies=[Depends(require_role("lecturer"))])
async def get_dashboard(authorization: str = Header(None)):
    """Get lecturer dashboard with all assignments and schedule"""
    lecturer = await get_current_lecturer(authorization)
    
    # Get all assignments
    assignments = []
    cursor = db.lecturer_assignments.find({"lecturer_id": lecturer["id"]})
    async for assignment in cursor:
        assignments.append(_serialize(assignment))
    
    # Get timetable entries
    timetable = []
    tt_cursor = db.timetable_entries.find({"lecturer_id": lecturer["id"]})
    async for entry in tt_cursor:
        timetable.append(_serialize(entry))
    
    return {
        "lecturer": lecturer,
        "assignments": assignments,
        "timetable": timetable,
        "total_assignments": len(assignments),
        "confirmed_classes": len([a for a in assignments if a.get("class_status") == "confirmed"])
    }

