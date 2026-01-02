"""
Timetable generation and clash detection service
Ensures no clashes and optimizes schedules
"""

from datetime import datetime, time, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict


class ClashDetector:
    """Detects clashes in timetable assignments"""
    
    def __init__(self):
        self.lecturer_schedule = defaultdict(list)
        self.student_schedule = defaultdict(list)
        self.room_schedule = defaultdict(list)
    
    def add_schedule(self, entity_id: str, entity_type: str, slot: Dict):
        """
        Add a schedule entry
        entity_type: 'lecturer', 'student', 'room'
        slot: {day, start_time, end_time}
        """
        schedule_dict = {
            'lecturer': self.lecturer_schedule,
            'student': self.student_schedule,
            'room': self.room_schedule
        }
        schedule_dict[entity_type][entity_id].append(slot)
    
    def has_clash(self, entity_id: str, entity_type: str, slot: Dict) -> bool:
        """Check if slot clashes with existing schedule"""
        schedule_dict = {
            'lecturer': self.lecturer_schedule,
            'student': self.student_schedule,
            'room': self.room_schedule
        }
        
        existing_slots = schedule_dict[entity_type].get(entity_id, [])
        
        for existing in existing_slots:
            if self._slots_overlap(existing, slot):
                return True
        return False
    
    def _slots_overlap(self, slot1: Dict, slot2: Dict) -> bool:
        """Check if two time slots overlap"""
        # Same day
        if slot1['day'] != slot2['day']:
            return False
        
        start1 = self._time_to_minutes(slot1['start_time'])
        end1 = self._time_to_minutes(slot1['end_time'])
        start2 = self._time_to_minutes(slot2['start_time'])
        end2 = self._time_to_minutes(slot2['end_time'])
        
        # Check for overlap
        return not (end1 <= start2 or end2 <= start1)
    
    @staticmethod
    def _time_to_minutes(t: time) -> int:
        """Convert time to minutes since midnight"""
        if isinstance(t, str):
            hours, minutes = map(int, t.split(':'))
            return hours * 60 + minutes
        return t.hour * 60 + t.minute


class TimetableGenerator:
    """Generates clash-free timetables"""
    
    def __init__(self):
        self.clash_detector = ClashDetector()
    
    def generate_timetable(self, assignments: List[Dict], available_slots: List[Dict]) -> Dict:
        """
        Generate timetable from lecturer assignments and available slots
        
        assignments: List of lecturer assignments {lecturer_id, course_id, unit_id, ...}
        available_slots: List of available time slots {day, start_time, end_time, ...}
        
        Returns: {timetable: [...], clashes: [...], unassigned: [...]}
        """
        timetable = []
        clashes = []
        unassigned = []
        
        for assignment in assignments:
            assigned = False
            
            for slot in available_slots:
                # Check for clashes
                lecturer_slot = {
                    'day': slot['day'],
                    'start_time': slot['start_time'],
                    'end_time': slot['end_time']
                }
                
                if not self.clash_detector.has_clash(
                    assignment['lecturer_id'], 'lecturer', lecturer_slot
                ):
                    # Assign this slot
                    entry = {
                        'assignment_id': assignment.get('_id'),
                        'lecturer_id': assignment['lecturer_id'],
                        'unit_id': assignment['unit_id'],
                        'course_id': assignment['course_id'],
                        'room_id': assignment['room_id'],
                        'day': slot['day'],
                        'start_time': slot['start_time'],
                        'end_time': slot['end_time'],
                        'status': 'active',
                        'created_at': datetime.utcnow().isoformat()
                    }
                    timetable.append(entry)
                    self.clash_detector.add_schedule(
                        assignment['lecturer_id'], 'lecturer', lecturer_slot
                    )
                    assigned = True
                    break
            
            if not assigned:
                unassigned.append({
                    'assignment_id': assignment.get('_id'),
                    'lecturer_id': assignment['lecturer_id'],
                    'reason': 'No available slot without clash'
                })
        
        return {
            'timetable': timetable,
            'clashes': clashes,
            'unassigned': unassigned,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def detect_clashes(self, timetable: List[Dict]) -> List[Dict]:
        """Detect all clashes in a timetable"""
        clashes = []
        lecturer_slots = defaultdict(list)
        room_slots = defaultdict(list)
        
        # Group by lecturer and room
        for entry in timetable:
            lecturer_slots[entry['lecturer_id']].append(entry)
            room_slots[entry['room_id']].append(entry)
        
        # Check lecturer clashes
        for lecturer_id, entries in lecturer_slots.items():
            for i, entry1 in enumerate(entries):
                for entry2 in entries[i+1:]:
                    if self._entries_overlap(entry1, entry2):
                        clashes.append({
                            'type': 'lecturer_clash',
                            'lecturer_id': lecturer_id,
                            'entry1': entry1,
                            'entry2': entry2
                        })
        
        # Check room clashes
        for room_id, entries in room_slots.items():
            for i, entry1 in enumerate(entries):
                for entry2 in entries[i+1:]:
                    if self._entries_overlap(entry1, entry2):
                        clashes.append({
                            'type': 'room_clash',
                            'room_id': room_id,
                            'entry1': entry1,
                            'entry2': entry2
                        })
        
        return clashes
    
    @staticmethod
    def _entries_overlap(entry1: Dict, entry2: Dict) -> bool:
        """Check if two timetable entries overlap"""
        if entry1['day'] != entry2['day']:
            return False
        
        start1 = ClashDetector._time_to_minutes(entry1['start_time'])
        end1 = ClashDetector._time_to_minutes(entry1['end_time'])
        start2 = ClashDetector._time_to_minutes(entry2['start_time'])
        end2 = ClashDetector._time_to_minutes(entry2['end_time'])
        
        return not (end1 <= start2 or end2 <= start1)


class ScheduleValidator:
    """Validates schedules against business rules"""
    
    @staticmethod
    def validate_duration(duration_hours: int) -> bool:
        """Validate class duration (2 or 3 hours)"""
        return duration_hours in [2, 3]
    
    @staticmethod
    def validate_room_capacity(student_count: int, room_capacity: int) -> bool:
        """Validate room can accommodate students"""
        return student_count <= room_capacity
    
    @staticmethod
    def validate_no_double_booking(slots: List[Dict]) -> bool:
        """Validate no time slot is booked twice"""
        slot_keys = set()
        for slot in slots:
            key = (slot['day'], slot['start_time'], slot['end_time'])
            if key in slot_keys:
                return False
            slot_keys.add(key)
        return True
