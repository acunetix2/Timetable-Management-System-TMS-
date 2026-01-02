import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useStudentTimetable } from '@/hooks/useApi';
import { AlertTriangle, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface ClashInfo {
  id: string;
  courses: string[];
  day: string;
  startTime: string;
  endTime: string;
  rooms: string[];
}

const StudentClashes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: timetableResponse = { data: [] }, isLoading } = useStudentTimetable();

  // Unwrap timetable data
  const timetableEntries = Array.isArray(timetableResponse) 
    ? timetableResponse 
    : (timetableResponse?.data || []);

  // Detect clashes by finding overlapping time slots
  const detectClashes = (): ClashInfo[] => {
    const clashes: ClashInfo[] = [];
    
    // Group entries by day and time slot
    const timeSlotMap = new Map<string, any[]>();
    
    timetableEntries.forEach((entry: any) => {
      const key = `${entry.day || 'N/A'}-${entry.start_time || entry.startTime}`;
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, []);
      }
      timeSlotMap.get(key)!.push(entry);
    });

    // Find clashes (multiple entries at same time)
    let clashCounter = 0;
    timeSlotMap.forEach((entries, key) => {
      if (entries.length > 1) {
        const [day, startTime] = key.split('-');
        clashes.push({
          id: `clash-${clashCounter++}`,
          courses: entries.map((e: any) => e.course_name || e.course_code || 'Unknown'),
          day,
          startTime,
          endTime: entries[0]?.end_time || entries[0]?.endTime || 'Unknown',
          rooms: entries.map((e: any) => e.room_name || e.room || 'TBA'),
        });
      }
    });

    return clashes;
  };

  const clashes = detectClashes();

  if (isLoading) {
    return (
      <DashboardLayout role="student" userName={user?.name || 'Student'} onLogout={() => navigate('/')}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" userName={user?.name || 'Student'} onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Clash Alerts</h1>
          <p className="text-muted-foreground">Schedule conflicts that need your attention</p>
        </div>

        {clashes.length === 0 ? (
          <Card className="bg-green-50 border-green-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Clashes Detected</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Great news! Your timetable is free of scheduling conflicts. All your classes are properly arranged.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {clashes.map((clash, index) => (
              <Card
                key={clash.id}
                className="border-red-200 bg-red-50 shadow-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Schedule Conflict</h3>
                        <p className="text-sm text-muted-foreground">
                          {clash.courses.length} classes scheduled at same time
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Conflict
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {clash.day} {clash.startTime} - {clash.endTime}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-sm">Courses:</span>
                        <div className="flex flex-wrap gap-2">
                          {clash.courses.map((course, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white rounded border border-red-200 text-sm">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-sm">Rooms:</span>
                        <div className="flex flex-wrap gap-2">
                          {clash.rooms.map((room, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white rounded border border-red-200 text-sm">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {room}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        Request Change
                      </Button>
                      <Button size="sm" variant="ghost">
                        Contact Admin
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentClashes;
