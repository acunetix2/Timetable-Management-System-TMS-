// API configuration and base client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // expose baseURL for other modules that may need to call endpoints directly
  get baseURLPublic() {
    return this.baseURL;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const body = (options as unknown as { body?: string }).body;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // If sending FormData, let the browser set Content-Type (multipart/form-data)
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // remove Content-Type so browser can set proper boundary
      delete (headers as Record<string, string>)['Content-Type'];
    }

    // Reload token from localStorage to ensure we have the latest
    this.token = localStorage.getItem('auth_token');
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    // Ensure body is included if it exists
    if (body) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email: string, password: string, role: string) {
    // send JSON body with role for role-based login
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    role: string;
  }) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Public helper to fetch the current user (uses internal request so auth header is attached)
  async getMe() {
    return this.request<{ user: any }>('/auth/me', { method: 'GET' });
  }

  // Student endpoints
  async getStudentTimetable() {
    return this.request<any[]>('/student/timetable');
  }

  async getStudentEnrollments() {
    return this.request<any[]>('/student/enrollments');
  }

  async enrollInCourse(courseId: string, unitIds: string[]) {
    return this.request<any>(`/student/enroll/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ unit_ids: unitIds }),
    });
  }

  async getAvailableCourses() {
    return this.request<any[]>('/student/courses');
  }

  async getStudentDepartments() {
    return this.request<any[]>('/student/departments');
  }

  // Lecturer endpoints
  async setLecturerAvailability(availability: { days: string[] }) {
    return this.request<{ message: string }>('/lecturer/availability', {
      method: 'POST',
      body: JSON.stringify(availability),
    });
  }

  // Generic CRUD operations for admin
  async getCourses() {
    return this.request<any[]>('/admin/courses');
  }

  async createCourse(course: any) {
    return this.request<{ message: string; course?: any }>('/admin/course', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  }

  async createDepartment(name: string) {
    return this.request<any>('/admin/department', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getDepartments() {
    return this.request<any[]>('/admin/departments');
  }

  async assignUnitLecturer(courseId: string, unitId: string, lecturerEmail: string) {
    return this.request<any>(`/admin/course/${courseId}/unit/${unitId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ lecturerEmail }),
    });
  }

  async createCourseUnit(courseId: string, unit: { code: string; name: string }) {
    return this.request<any>(`/admin/course/${courseId}/unit`, {
      method: 'POST',
      body: JSON.stringify(unit),
    });
  }

  async updateCourse(id: string, data: any) {
    return this.request<any>(`/admin/course/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string) {
    return this.request<any>(`/admin/course/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCourseRoom(courseId: string, roomId: string) {
    return this.request<any>(`/admin/course/${courseId}/room`, {
      method: 'PUT',
      body: JSON.stringify({ room_id: roomId }),
    });
  }

  async enrollCourse(courseId: string, units: string[]) {
    return this.request<any>('/student/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId, units }),
    });
  }

  async getEnrollments() {
    return this.request<any[]>('/student/enrollments');
  }

  async getLecturerAssignments() {
    return this.request<any[]>('/lecturer/assignments');
  }

  async getLecturerAssignmentDetail(assignmentId: string) {
    return this.request<any>(`/lecturer/assignments/${assignmentId}`);
  }

  async getLecturerAvailableSlots(assignmentId: string) {
    return this.request<any[]>(`/lecturer/available-slots/${assignmentId}`);
  }

  async selectTimeSlot(data: { assignment_id: string; day: string; start_time: string; end_time: string }) {
    return this.request<any>('/lecturer/select-time-slot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLecturerDashboard() {
    return this.request<any>('/lecturer/dashboard');
  }

  async setUnitAvailability(unitId: string, available: boolean) {
    return this.request<any>('/lecturer/availability/unit', {
      method: 'POST',
      body: JSON.stringify({ unitId, available }),
    });
  }

  async getUnitAvailability() {
    return this.request<any[]>('/lecturer/availability/unit');
  }

  async getAllUnitAvailability() {
    return this.request<any[]>('/lecturer/availability/unit/all');
  }

  async getRooms() {
    return this.request<any[]>('/admin/rooms');
  }

  async createRoom(room: any) {
    return this.request<{ message: string; room?: any }>('/admin/room', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  }

  async updateRoom(id: string, data: any) {
    return this.request<any>(`/admin/room/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: string) {
    return this.request<any>(`/admin/room/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request<any[]>('/auth/users');
  }

  async getTimetable() {
    return this.request<any[]>('/admin/timetable');
  }

  async createTimeslot(slot: any) {
    return this.request<{ message: string; slot?: any }>('/admin/timeslot', {
      method: 'POST',
      body: JSON.stringify(slot),
    });
  }

  async assignRoomsToUnits() {
    return this.request<any>('/admin/assign-rooms-to-units', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
// make baseURL accessible for other modules
(apiClient as any)['baseURL'] = API_BASE_URL;