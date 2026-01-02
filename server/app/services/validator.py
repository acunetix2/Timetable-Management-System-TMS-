def validate(timetable):
    seen = set()
    clashes = []

    for entry in timetable:
        key = (entry["lecturer"], entry["timeslot"])
        if key in seen:
            clashes.append(entry)
        seen.add(key)

    return clashes
