export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits?: number;
  lecturerId?: string;
  enrolledStudents?: number;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  building?: string;
  capacity?: number;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  roomId?: string;
  timeSlotId: string; // e.g. monday-0
  hasClash?: boolean;
  clashReason?: string;
}
// API types that match backend models
export interface User {
  email: string;
  role: 'admin' | 'lecturer' | 'student';
  password?: string; // Only for registration
}

export interface Course {
  code: string;
  name: string;
  lecturer_id: string;
  students: string[];
}

export interface Room {
  id?: string;
  name: string;
  building?: string;
  capacity?: number;
  facilities?: string[];
}

export interface TimetableEntry {
  course: string;
  lecturer: string;
  room: string;
  timeslot: string;
}

export interface LecturerAvailability {
  days: string[];
}

// Auth response types
export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message: string;
}

// Frontend-specific types for UI
export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];