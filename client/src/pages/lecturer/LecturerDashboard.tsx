import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import { useLecturerAssignments } from '@/hooks/useApi';
import { Calendar, BookOpen, Users, Clock, CheckCircle2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: assignmentsResponse = { data: [] }, isLoading } = useLecturerAssignments();
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : (assignmentsResponse?.data || []);

  const confirmedAssignments = assignments.filter((a: any) => a.class_status === 'confirmed');
  const pendingAssignments = assignments.filter((a: any) => a.class_status === 'pending');
  const totalStudents = assignments.reduce((sum: number, a: any) => sum + (a.student_count || 0), 0);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's your teaching schedule overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Assignments"
            value={assignments.length}
            icon={BookOpen}
            description="Units assigned to teach"
          />
          <StatsCard
            title="Confirmed Classes"
            value={confirmedAssignments.length}
            icon={CheckCircle2}
            variant="secondary"
            description="Ready to teach"
          />
          <StatsCard
            title="Pending Schedule"
            value={pendingAssignments.length}
            icon={Clock}
            description="Awaiting time selection"
          />
          <StatsCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            description="Across all classes"
          />
        </div>

        {/* Assignments Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Assignments */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Assignments ({pendingAssignments.length})
              </h2>
              <p className="text-sm text-muted-foreground">Select time slots for these units</p>
            </div>
            <div className="space-y-3">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{assignment.course_name || assignment.course_id}</p>
                        <p className="text-sm text-muted-foreground">{assignment.unit_name || assignment.unit_id}</p>
                        <p className="text-xs text-muted-foreground mt-1">Students: {assignment.student_count}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50">Pending</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/lecturer/availability`)}
                      className="w-full"
                    >
                      Select Time Slot
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending assignments</p>
              )}
            </div>
          </Card>

          {/* Confirmed Assignments */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Confirmed Schedule ({confirmedAssignments.length})
              </h2>
              <p className="text-sm text-muted-foreground">Your scheduled classes</p>
            </div>
            <div className="space-y-3">
              {confirmedAssignments.length > 0 ? (
                confirmedAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="border border-green-200 rounded-lg p-4 bg-green-50/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{assignment.course_name || assignment.course_id}</p>
                        <p className="text-sm text-muted-foreground">{assignment.unit_name || assignment.unit_id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Room: {assignment.room || assignment.room_name || 'TBA'}
                        </p>
                      </div>
                      <Badge className="bg-green-600">Confirmed</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No confirmed assignments yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;
