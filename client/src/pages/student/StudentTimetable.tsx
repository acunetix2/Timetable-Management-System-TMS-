import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useStudentTimetable } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Download, Printer, Share2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const StudentTimetable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: timetableResponse = { data: [] }, isLoading } = useStudentTimetable();
  const timetableEntries = Array.isArray(timetableResponse) ? timetableResponse : (timetableResponse?.data || []);

  const handleDownload = () => {
    toast({
      title: 'Download Started',
      description: 'Your timetable is being prepared for download.',
    });
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">My Timetable</h1>
            <p className="text-muted-foreground">{timetableEntries.length} scheduled classes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Timetable */}
        <Card className="p-6">
          {timetableEntries.length > 0 ? (
            <div className="space-y-3">
              {(timetableEntries as any[]).map((entry: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="grid sm:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Day</p>
                      <p className="font-semibold">{entry.day}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">{entry.start_time} - {entry.end_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-semibold">{entry.course_code || entry.course_name || entry.course_id}</p>
                      <p className="text-xs text-muted-foreground">{entry.unit_code || entry.unit_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room</p>
                      <p className="font-semibold">{entry.room || entry.room_name || 'TBA'}</p>
                      {entry.room_house && <p className="text-xs text-muted-foreground">House: {entry.room_house}</p>}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lecturer</p>
                      <p className="font-semibold">{entry.lecturer_name || 'TBA'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No timetable entries yet. Enroll in courses to see your schedule.</p>
              <Button
                onClick={() => navigate('/student/courses')}
                className="mt-4"
              >
                Enroll in Courses
              </Button>
            </div>
          )}
        </Card>

        {/* Legend */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 border-l-2 border-primary"></div>
              <span className="text-muted-foreground">Scheduled Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border-l-2 border-muted-foreground"></div>
              <span className="text-muted-foreground">Free Slot</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;
