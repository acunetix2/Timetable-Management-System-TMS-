import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStudentTimetable, useStudentEnrollments } from "@/hooks/useApi";
import { Calendar, BookOpen, AlertCircle, Download, Share2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: timetableResponse = { data: [] }, isLoading: timetableLoading } = useStudentTimetable();
  const timetable = Array.isArray(timetableResponse) ? timetableResponse : (timetableResponse?.data || []);
  
  const { data: enrollmentsResponse = { data: [] }, isLoading: enrollmentsLoading } = useStudentEnrollments();
  const enrollments = Array.isArray(enrollmentsResponse) ? enrollmentsResponse : (enrollmentsResponse?.data || []);

  const handleDownloadTimetable = () => {
    toast({
      title: "Download Started",
      description: "Your timetable is being prepared...",
    });
  };

  const handleShareTimetable = () => {
    toast({
      title: "Share Options",
      description: "Share timetable via email or link",
    });
  };

  if (timetableLoading || enrollmentsLoading) {
    return (
      <DashboardLayout role="student" userName={user?.name || "Student"} onLogout={() => navigate("/")}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const uniqueCourses = Array.from(
    new Map((enrollments as any[]).map((e: any) => [e.course_id, e])).values()
  );

  return (
    <DashboardLayout role="student" userName={user?.name || "Student"} onLogout={() => navigate("/")}>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's your academic schedule overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueCourses.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Units</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{enrollments.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-indigo-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Classes This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{timetable.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Schedule Clashes</p>
                <p className="text-3xl font-bold text-green-600 mt-2">0</p>
              </div>
              <AlertCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Enrolled Courses</h2>
          {uniqueCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueCourses.map((enrollment: any, index: number) => (
                <Card 
                  key={enrollment.id} 
                  className="p-6 hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm font-medium">Course Code</p>
                      <h3 className="text-lg font-bold">{enrollment.course_code || 'Course'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{enrollment.course_name}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap ml-2">
                      {enrollment.unit_count || enrollment.unit_ids?.length || 0} units
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Enrolled on {enrollment.created_at ? new Date(enrollment.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/student/courses")}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses enrolled yet</p>
              <Button 
                onClick={() => navigate("/student/courses")}
                className="mt-4"
              >
                Browse Courses
              </Button>
            </Card>
          )}
        </div>

        {/* Timetable Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Timetable</h2>
            <div className="flex gap-2">
              <Button onClick={handleDownloadTimetable} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShareTimetable} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Card className="p-6">
            {timetable.length > 0 ? (
              <div className="space-y-2">
                {(timetable as any[]).map((entry: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{entry.day} - {entry.start_time} to {entry.end_time}</p>
                        <p className="text-sm text-muted-foreground">Unit: {entry.name}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Room: {entry.room || entry.room_name || "TBA"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No timetable entries yet. Enroll in courses to see your schedule.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
