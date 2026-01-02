import { Course } from '@/types/api';
import { Users, BookOpen, Award } from 'lucide-react';
import { useUsers, useDepartments } from '@/hooks/useApi';

interface CourseCardProps {
  course: Course;
  showLecturer?: boolean;
}

const CourseCard = ({ course, showLecturer = true }: CourseCardProps) => {
  const { data: users = [] } = useUsers();
  const lecturer = users.find((u: any) => u.email === course.lecturerId || u.email === course.lecturer);
  const { data: departments = [] } = useDepartments();
  const dept = departments.find((d: any) => String(d.id) === String(course.departmentId));

  return (
    <div
      className="bg-card rounded-xl border shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in"
      style={{ borderLeftWidth: '4px', borderLeftColor: course.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${course.color}20`, color: course.color }}
        >
          {course.code}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Award className="w-4 h-4" />
          <span className="text-sm">{course.credits} credits</span>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">{course.name}</h3>

      {showLecturer && lecturer && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{lecturer.name.charAt(0)}</span>
          </div>
          <span>{lecturer.name}</span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">{course.enrolledStudents ?? 0} students</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">{(course.units || []).length} units</span>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">{dept ? dept.name : '-'}</div>
      </div>
    </div>
  );
};

export default CourseCard;
