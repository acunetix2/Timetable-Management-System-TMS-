import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import TimetableGrid from '@/components/TimetableGrid';
import { useLecturerAssignments } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Download, Printer, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LecturerSchedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: assignmentsResponse = { data: [] }, isLoading } = useLecturerAssignments();
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : (assignmentsResponse?.data || []);
  
  // Filter confirmed assignments to display in timetable
  const confirmedAssignments = assignments.filter((a: any) => a.class_status === 'confirmed');

  if (isLoading) {
    return (
      <DashboardLayout role="lecturer" userName={user?.name || 'Lecturer'} onLogout={() => navigate('/')}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lecturer" userName={user?.name || 'Lecturer'} onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Teaching Schedule</h1>
            <p className="text-muted-foreground">{confirmedAssignments.length} confirmed classes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Your Assigned Classes</h2>
          {confirmedAssignments.length > 0 ? (
            <div className="grid gap-4">
              {confirmedAssignments.map((assignment: any) => (
                <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="grid sm:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-semibold">{assignment.course_name || assignment.course_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-semibold">{assignment.unit_name || assignment.unit_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room</p>
                      <p className="font-semibold">{assignment.room || assignment.room_name || 'TBA'}</p>
                      {assignment.room_house && <p className="text-xs text-muted-foreground">House: {assignment.room_house}</p>}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="font-semibold">{assignment.student_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-600">{assignment.class_status || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No confirmed classes yet. Select time slots in Availability section.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerSchedule;
