import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Check, Loader, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailableCourses, useStudentEnrollments, useEnrollInCourse } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';

const StudentCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch data using React Query hooks
  const { data: coursesResponse = { data: [] }, isLoading: coursesLoading } = useAvailableCourses();
  const { data: enrollmentsResponse = { data: [] }, isLoading: enrollmentsLoading } = useStudentEnrollments();
  const enrollCoursesMutation = useEnrollInCourse();

  // Unwrap data from response format
  const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
  const enrollments = Array.isArray(enrollmentsResponse) ? enrollmentsResponse : (enrollmentsResponse?.data || []);
  const loading = coursesLoading || enrollmentsLoading;

  // Filter courses by search term
  const filteredCourses = courses.filter((c: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.code?.toLowerCase().includes(searchLower) ||
      c.name?.toLowerCase().includes(searchLower)
    );
  });

  // Get the selected course details
  const currentCourse = selectedCourse
    ? courses.find((c: any) => {
        const courseId = String(c.id || c._id);
        return courseId === selectedCourse;
      })
    : null;

  const handleEnroll = async () => {
    if (!currentCourse) {
      toast({
        title: 'Error',
        description: 'Please select a course',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUnits.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one unit',
        variant: 'destructive',
      });
      return;
    }

    try {
      const courseId = currentCourse.id || currentCourse._id;
      if (!courseId) {
        throw new Error('Course ID not found');
      }
      
      await enrollCoursesMutation.mutateAsync({
        courseId: String(courseId),
        unitIds: selectedUnits
      });

      toast({
        title: 'Success',
        description: 'Successfully enrolled in course units',
      });
      setSelectedUnits([]);
      setSelectedCourse('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
    }
  };

  const toggleUnit = (unitId: string) => {
    if (selectedUnits.includes(unitId)) {
      setSelectedUnits(selectedUnits.filter(id => id !== unitId));
    } else {
      setSelectedUnits([...selectedUnits, unitId]);
    }
  };

  const enrolledCourseIds = enrollments.map(e => String(e.course_id));

  if (loading) {
    return (
      <DashboardLayout role="student" userName={user?.name || 'Student'} onLogout={() => navigate('/')}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const enrolledCount = enrollments.length;
  const isCurrentCourseEnrolled = currentCourse && enrolledCourseIds.includes(String(currentCourse._id || currentCourse.id));

  return (
    <DashboardLayout role="student" userName={user?.name || 'Student'} onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Course Enrollment</h1>
          <p className="text-muted-foreground">Select a department and course to enroll</p>
        </div>

        {/* Enrollment Summary */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">My Courses</h3>
              <p className="text-sm text-blue-700">
                {enrolledCount === 0 
                  ? 'You have not enrolled in any courses yet' 
                  : `Enrolled in ${enrolledCount} course${enrolledCount !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Badge className="bg-blue-600">{enrolledCount} Courses</Badge>
          </div>
        </Card>

        {/* Enrolled Courses Section */}
        {enrolledCount > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Enrolled Courses</h2>
            <div className="grid gap-3">
              {enrollments.map((enrollment: any) => {
                return (
                  <Card key={enrollment.id} className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{enrollment.course_code || enrollment.course_name || 'Course'}</h3>
                        <p className="text-sm text-muted-foreground">{enrollment.course_name}</p>
                        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {enrollment.unit_count || enrollment.unit_ids?.length || 0} units
                          </Badge>
                          {enrollment.created_at && (
                            <span>Enrolled on {new Date(enrollment.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Browse and Enroll in Courses */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Browse and Enroll in Courses</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by code or name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div>
            <div className="text-sm text-muted-foreground mb-3">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
            
            {filteredCourses.length > 0 ? (
              <div className="grid gap-3">
                {filteredCourses.map((course: any) => {
                  const courseId = course.id || course._id;
                  const isSelected = selectedCourse === String(courseId);
                  const isEnrolled = enrollments.some(e => String(e.course_id) === String(courseId));
                  
                  return (
                    <Card
                      key={courseId}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      } ${isEnrolled ? 'bg-green-50 border-green-200' : ''}`}
                      onClick={() => {
                        setSelectedCourse(String(courseId));
                        setSelectedUnits([]);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{course.code}</h3>
                            {isEnrolled && <Badge className="bg-green-600">Enrolled</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{course.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                            <span>📚 {(course.units || []).length} units</span>
                            <span>⏱️ {course.duration_years || 3}-year program</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No courses match your search' : 'No courses available'}
                </p>
              </Card>
            )}
          </div>

          {/* Course Details and Unit Selection */}
          {selectedCourse && currentCourse && (
            <Card className={`p-6 space-y-4 ${isCurrentCourseEnrolled ? 'bg-green-50 border-green-200' : ''}`}>
              {/* Course Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{currentCourse.code}</h3>
                  {isCurrentCourseEnrolled && <Badge className="bg-green-600">Enrolled</Badge>}
                </div>
                <p className="text-muted-foreground">{currentCourse.name}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
                  <span>📚 {(currentCourse.units || []).length} units</span>
                  <span>⏱️ {currentCourse.duration_years || 3}-year program</span>
                </div>
              </div>

              {/* Units */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Course Units</h4>
                {(currentCourse.units || []).length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {currentCourse.units.map((unit: any) => {
                      const isSelected = selectedUnits.includes(unit._id || unit.id);
                      return (
                        <div
                          key={unit._id || unit.id}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <Checkbox
                            id={`unit-${unit._id || unit.id}`}
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleUnit(unit._id || unit.id)
                            }
                            disabled={isCurrentCourseEnrolled}
                          />
                          <label
                            htmlFor={`unit-${unit._id || unit.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-sm">{unit.code || unit.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {unit.name || unit.description}
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                              <span>Year {unit.year || 1}</span>
                              <span>Sem {unit.semester || 1}</span>
                              <span>{unit.total_hours || 45}h</span>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No units available</p>
                )}
              </div>

              {/* Enrollment Button */}
              {!isCurrentCourseEnrolled ? (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleEnroll}
                    disabled={enrollCoursesMutation.isPending || selectedUnits.length === 0}
                    className="flex-1"
                  >
                    {enrollCoursesMutation.isPending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Enroll ({selectedUnits.length} units)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUnits([])}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium">✓ Already enrolled in this course</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
