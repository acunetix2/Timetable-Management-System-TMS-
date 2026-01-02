def greedy_schedule(courses, rooms, slots, availability):
    timetable = []
    lecturer_busy = {}
    room_busy = {}

    for course in courses:
        for slot in slots:
            if slot["day"] not in availability.get(course.get("lecturer_id"), []):
                continue
            l_key = (course.get("lecturer_id"), slot["day"], slot["start"])
            if l_key in lecturer_busy:
                continue
            room = next(
                (r for r in rooms if r.get("capacity", 0) >= len(course.get("students", []))
                 and (r.get("name"), slot["day"], slot["start"]) not in room_busy),
                None
            )
            if not room:
                continue

            lecturer_busy[l_key] = True
            room_busy[(room["name"], slot["day"], slot["start"])] = True

            timetable.append({
                "course": course.get("code") or course.get("course"),
                "course_id": course.get("course_id"),
                "unit_id": course.get("unit_id"),
                "unit_code": course.get("unit_code"),
                "lecturer": course.get("lecturer_id"),
                "room": room["name"],
                "timeslot": f"{slot['day']} {slot['start']}-{slot['end']}"
            })
            break

    return timetable
