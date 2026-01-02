import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useLecturerAssignments } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Loader, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LecturerCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: assignmentsResponse = { data: [] }, isLoading } = useLecturerAssignments();
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : (assignmentsResponse?.data || []);

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
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            {assignments.length} courses assigned this semester
          </p>
        </div>

        {/* Course Grid */}
        {assignments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment: any, index: number) => (
              <div
                key={assignment.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.course_name || assignment.course_id}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.unit_name || assignment.unit_id}</p>
                      </div>
                    </div>
                    <Badge variant={assignment.class_status === 'confirmed' ? 'default' : 'secondary'}>
                      {assignment.class_status}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Course Code</p>
                      <p className="font-medium">{assignment.course_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Code</p>
                      <p className="font-medium">{assignment.unit_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room</p>
                      <p className="font-medium">{assignment.room || assignment.room_name || 'TBA'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Student Count</p>
                      <p className="font-medium">{assignment.student_count || 0} students</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses assigned yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerCourses;
