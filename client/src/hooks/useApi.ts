import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: { email: string; password: string; role: string }) =>
      apiClient.register(userData),
  });
};

export const useAddCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (course: any) => apiClient.createCourse(course),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useAddUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, unit }: { courseId: string; unit: any }) => apiClient.createCourseUnit(courseId, unit),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateCourse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useAddRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (room: any) => apiClient.createRoom(room),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
};


export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.createDepartment(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useAssignUnitLecturer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, unitId, lecturerEmail }: { courseId: string; unitId: string; lecturerEmail: string }) => apiClient.assignUnitLecturer(courseId, unitId, lecturerEmail),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateRoom(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
};

export const useAddTimeslot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slot: any) => apiClient.createTimeslot(slot),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timetable'] }),
  });
};

// Student hooks
export const useStudentTimetable = () => {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: () => apiClient.getStudentTimetable(),
  });
};

export const useStudentEnrollments = () => {
  return useQuery({
    queryKey: ['student', 'enrollments'],
    queryFn: () => apiClient.getStudentEnrollments(),
  });
};

export const useEnrollInCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, unitIds }: { courseId: string; unitIds: string[] }) => 
      apiClient.enrollInCourse(courseId, unitIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', 'enrollments'] });
      qc.invalidateQueries({ queryKey: ['student', 'timetable'] });
    },
  });
};

export const useAvailableCourses = () => {
  return useQuery({
    queryKey: ['available_courses'],
    queryFn: () => apiClient.getAvailableCourses(),
  });
};

// Lecturer hooks
export const useSetLecturerAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (availability: { days: string[] }) =>
      apiClient.setLecturerAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lecturer', 'availability'] });
    },
  });
};

// Admin hooks
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => apiClient.getCourses(),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient.getDepartments(),
  });
};

export const useLecturerAssignments = () => {
  return useQuery({
    queryKey: ['lecturer', 'assignments'],
    queryFn: () => apiClient.getLecturerAssignments(),
  });
};

export const useLecturerAssignmentDetail = (assignmentId: string) => {
  return useQuery({
    queryKey: ['lecturer', 'assignment', assignmentId],
    queryFn: () => apiClient.getLecturerAssignmentDetail(assignmentId),
  });
};

export const useLecturerAvailableSlots = (assignmentId: string) => {
  return useQuery({
    queryKey: ['lecturer', 'available_slots', assignmentId],
    queryFn: () => apiClient.getLecturerAvailableSlots(assignmentId),
  });
};

export const useSelectTimeSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { assignment_id: string; day: string; start_time: string; end_time: string }) => apiClient.selectTimeSlot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturer', 'assignments'] }),
  });
};

export const useLecturerDashboard = () => {
  return useQuery({
    queryKey: ['lecturer', 'dashboard'],
    queryFn: () => apiClient.getLecturerDashboard(),
  });
};

export const useSetUnitAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, available }: { unitId: string; available: boolean }) => apiClient.setUnitAvailability(unitId, available),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturer', 'assignments'] }),
  });
};

export const useUnitAvailability = () => {
  return useQuery({
    queryKey: ['lecturer', 'unit_availability'],
    queryFn: () => apiClient.getUnitAvailability(),
  });
};

export const useAllUnitAvailability = () => {
  return useQuery({
    queryKey: ['unit_availability', 'all'],
    queryFn: () => apiClient.getAllUnitAvailability(),
  });
};

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiClient.getRooms(),
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });
};

export const useTimetable = () => {
  return useQuery({
    queryKey: ['timetable'],
    queryFn: () => apiClient.getTimetable(),
  });
};

export const useAssignRoomsToUnits = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.assignRoomsToUnits(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['lecturer', 'assignments'] });
    },
  });
};