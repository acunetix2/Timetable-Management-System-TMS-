import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import { useCourses, useRooms, useUsers, useAssignRoomsToUnits } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import { Calendar, BookOpen, Users, Building, AlertTriangle, CheckCircle2, Play, Settings, Loader, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  // Fetch data from backend using React Query hooks
  const { data: coursesResponse = { data: [] }, isLoading: coursesLoading } = useCourses();
  const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);

  const { data: roomsResponse = { data: [] }, isLoading: roomsLoading } = useRooms();
  const rooms = Array.isArray(roomsResponse) ? roomsResponse : (roomsResponse?.data || []);

  const { data: usersResponse = { data: [] }, isLoading: usersLoading } = useUsers();
  const usersList = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);

  const assignRoomsToUnits = useAssignRoomsToUnits();

  const loading = coursesLoading || roomsLoading || usersLoading;

  // Calculate stats from fetched data
  const students = usersList.filter((u: any) => u.role === 'student');
  const lecturers = usersList.filter((u: any) => u.role === 'lecturer');

  const stats = {
    courses: courses.length,
    rooms: rooms.length,
    users: usersList.length,
    students: students.length,
    lecturers: lecturers.length,
    clashes: 0, // Will be fetched from timetable stats if available
    timetableEntries: 0
  };

  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      toast({
        title: 'Generating Timetable',
        description: 'Running optimization algorithm... This may take a moment.',
      });

      const res = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semester: 'Fall 2024',
          academic_year: '2024-2025'
        })
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: 'Success',
          description: `Timetable generated with ${result.timetable_entries?.length || 0} entries and ${result.clashes?.length || 0} detected clashes.`,
        });
        await fetchStats();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate timetable',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate timetable',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAssignRooms = async () => {
    try {
      setGenerating(true);
      toast({
        title: 'Assigning Rooms to Units',
        description: 'Running room assignment algorithm...',
      });

      const result = await assignRoomsToUnits.mutateAsync();
      
      toast({
        title: 'Success',
        description: `Assigned rooms to ${result.summary.assigned} units. ${result.summary.failed} units failed.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to assign rooms',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.name || 'Admin'} onLogout={() => navigate('/')}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.name || 'Admin'} onLogout={() => navigate('/')}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage timetables, courses, departments, and users</p>
          </div>
          <Button onClick={handleGenerateTimetable} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Timetable
              </>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Courses"
            value={stats.courses}
            icon={BookOpen}
            description="Academic programs"
          />
          <StatsCard
            title="Available Rooms"
            value={stats.rooms}
            icon={Building}
            variant="secondary"
          />
          <StatsCard
            title="Total Users"
            value={stats.users}
            icon={Users}
            description={`${stats.students} students, ${stats.lecturers} lecturers`}
          />
          <StatsCard
            title="Clashes Detected"
            value={stats.clashes}
            icon={AlertTriangle}
            variant={stats.clashes > 0 ? 'destructive' : 'default'}
          />
        </div>

        {/* System Status & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              System Status
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timetable Generated</span>
                  <Badge>{stats.timetableEntries} entries</Badge>
                </div>
                <Progress value={Math.min((stats.timetableEntries / 100) * 100, 100)} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Constraint Satisfaction</span>
                  <span className="font-medium">{stats.clashes === 0 ? '100' : '85'}%</span>
                </div>
                <Progress value={stats.clashes === 0 ? 100 : 85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Utilization</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Last generated: 2 hours ago</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/courses')}
              >
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span className="text-xs">Manage Courses</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/rooms')}
              >
                <Building className="w-6 h-6 text-purple-500" />
                <span className="text-xs">Manage Rooms</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/departments')}
              >
                <Users className="w-6 h-6 text-orange-500" />
                <span className="text-xs">Departments</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/timetable')}
              >
                <Calendar className="w-6 h-6 text-green-500" />
                <span className="text-xs">View Timetable</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleAssignRooms}
                disabled={assignRoomsToUnits.isPending}
              >
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="text-xs">Assign Rooms to Units</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleGenerateTimetable}
                disabled={generating}
              >
                <Zap className="w-6 h-6 text-red-500" />
                <span className="text-xs">Generate Timetable</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        {stats.clashes > 0 && (
          <Card className="p-6 border-red-200 bg-red-50/30">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Scheduling Conflicts Detected</h3>
                <p className="text-sm text-red-800 mb-4">
                  Found {stats.clashes} clash{stats.clashes !== 1 ? 'es' : ''} in the current timetable. Review and resolve conflicts to ensure optimal scheduling.
                </p>
                <Button size="sm" onClick={() => navigate('/admin/timetable')}>
                  View Conflicts
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Management Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </h3>
              <Badge variant="outline">{stats.students + stats.lecturers} active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <Badge variant="secondary">{stats.students}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lecturers</span>
                <Badge variant="secondary">{stats.lecturers}</Badge>
              </div>
              <Button onClick={() => navigate('/admin/users')} variant="outline" className="w-full mt-2">
                Manage Users
              </Button>
            </div>
          </Card>

          {/* Course Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Management
              </h3>
              <Badge variant="outline">{stats.courses} courses</Badge>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manage academic programs, units, and lecturer assignments
              </p>
              <Button onClick={() => navigate('/admin/courses')} variant="outline" className="w-full">
                Manage Courses
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
