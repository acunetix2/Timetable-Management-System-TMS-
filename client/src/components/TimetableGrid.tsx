import { AlertTriangle, MapPin, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { days, timeSlots } from '@/lib/constants';
import { useCourses, useRooms, useAllUnitAvailability } from '@/hooks/useApi';
import { TimetableEntry } from '@/types/api';

interface TimetableGridProps {
  entries: TimetableEntry[];
  showRoom?: boolean;
  showLecturer?: boolean;
}

const TimetableGrid = ({ entries, showRoom = true, showLecturer = false }: TimetableGridProps) => {
  const getEntryForSlot = (day: string, slotIndex: number): TimetableEntry | undefined => {
    const slotId = `${day.toLowerCase()}-${slotIndex}`;
    return entries.find((entry) => entry.timeSlotId === slotId);
  };

  const { data: courses = [] } = useCourses();
  const { data: rooms = [] } = useRooms();
  const { data: unitAvailability = [] } = useAllUnitAvailability();

  const getCourse = (courseId: string) => courses.find((c: any) => c.id === courseId);
  const getRoom = (roomId: string) => rooms.find((r: any) => r.id === roomId);

  return (
    <div className="overflow-x-auto animate-fade-in">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1">
          <div className="timetable-header rounded-tl-lg">Time</div>
          {days.map((day, index) => (
            <div
              key={day}
              className={`timetable-header ${index === days.length - 1 ? 'rounded-tr-lg' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Rows */}
        {timeSlots.map((slot, slotIndex) => (
          <div key={slot} className="grid grid-cols-[100px_repeat(5,1fr)] gap-1">
            <div className="timetable-cell bg-muted/30 font-medium text-sm flex items-center justify-center text-muted-foreground">
              {slot}
            </div>
            {days.map((day) => {
              const entry = getEntryForSlot(day, slotIndex);
              const course = entry ? getCourse(entry.courseId) : null;
              const room = entry ? getRoom(entry.roomId) : null;

              return (
                <div
                  key={`${day}-${slotIndex}`}
                  className={`timetable-cell relative ${
                    course ? 'bg-card shadow-sm' : 'bg-background'
                  }`}
                >
                  {course && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="h-full rounded-md p-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md relative"
                          style={{ backgroundColor: `${course.color}15`, borderLeft: `3px solid ${course.color}` }}
                        >
                          {entry?.hasClash && (
                            <div className="clash-indicator flex items-center justify-center">
                              <AlertTriangle className="w-2.5 h-2.5 text-destructive-foreground" />
                            </div>
                          )}
                          {/* Lecturer availability indicator (green=available, red=unavailable) */}
                          {entry && (entry.unit_id || entry.unitId) && (() => {
                            const uid = entry.unit_id || entry.unitId;
                            const ua = (unitAvailability as any[]).find(u => u.unitId === uid || u.unitId === String(uid));
                            if (!ua) return null;
                            return (
                              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${ua.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            );
                          })()}
                          <div className="font-semibold text-sm" style={{ color: course.color }}>
                            {course.code}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {course.name}
                          </div>
                          {showRoom && room && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              {room.name}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{course.name}</p>
                          <p className="text-sm text-muted-foreground">{course.code}</p>
                          {room && (
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {room.name}, {room.building}
                            </p>
                          )}
                          {entry?.hasClash && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {entry.clashReason}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;
