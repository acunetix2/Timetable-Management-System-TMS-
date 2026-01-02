import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

// Student pages
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentCourses from "./pages/student/StudentCourses";
import StudentClashes from "./pages/student/StudentClashes";
import StudentAccount from "./pages/student/StudentAccount";

// Lecturer pages
import LecturerLogin from "./pages/LecturerLogin";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerSchedule from "./pages/lecturer/LecturerSchedule";
import LecturerCourses from "./pages/lecturer/LecturerCourses";
import LecturerAvailability from "./pages/lecturer/LecturerAvailability";
import LecturerAccount from "./pages/lecturer/LecturerAccount";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminCourseDetail from "./pages/admin/AdminCourseDetail";
import AdminAccount from "./pages/admin/AdminAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/student/dashboard" element={<RequireAuth allowedRoles={['student']}><StudentDashboard /></RequireAuth>} />
            <Route path="/student/timetable" element={<RequireAuth allowedRoles={['student']}><StudentTimetable /></RequireAuth>} />
            <Route path="/student/courses" element={<RequireAuth allowedRoles={['student']}><StudentCourses /></RequireAuth>} />
            <Route path="/student/clashes" element={<RequireAuth allowedRoles={['student']}><StudentClashes /></RequireAuth>} />
            <Route path="/student/account" element={<RequireAuth allowedRoles={['student']}><StudentAccount /></RequireAuth>} />

            {/* Lecturer Routes */}
            <Route path="/lecturer/login" element={<LecturerLogin />} />
            <Route path="/lecturer/dashboard" element={<RequireAuth allowedRoles={['lecturer']}><LecturerDashboard /></RequireAuth>} />
            <Route path="/lecturer/schedule" element={<RequireAuth allowedRoles={['lecturer']}><LecturerSchedule /></RequireAuth>} />
            <Route path="/lecturer/courses" element={<RequireAuth allowedRoles={['lecturer']}><LecturerCourses /></RequireAuth>} />
            <Route path="/lecturer/availability" element={<RequireAuth allowedRoles={['lecturer']}><LecturerAvailability /></RequireAuth>} />
            <Route path="/lecturer/account" element={<RequireAuth allowedRoles={['lecturer']}><LecturerAccount /></RequireAuth>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<RequireAuth allowedRoles={['admin']}><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/timetable" element={<RequireAuth allowedRoles={['admin']}><AdminTimetable /></RequireAuth>} />
            <Route path="/admin/courses" element={<RequireAuth allowedRoles={['admin']}><AdminCourses /></RequireAuth>} />
            <Route path="/admin/rooms" element={<RequireAuth allowedRoles={['admin']}><AdminRooms /></RequireAuth>} />
            <Route path="/admin/departments" element={<RequireAuth allowedRoles={['admin']}><AdminDepartments /></RequireAuth>} />
            <Route path="/admin/course/:courseId" element={<RequireAuth allowedRoles={['admin']}><AdminCourseDetail /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth allowedRoles={['admin']}><AdminUsers /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth allowedRoles={['admin']}><AdminSettings /></RequireAuth>} />
            <Route path="/admin/account" element={<RequireAuth allowedRoles={['admin']}><AdminAccount /></RequireAuth>} />

            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

