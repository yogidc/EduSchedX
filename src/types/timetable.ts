// Time-related slots
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

// Room structure
export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'auditorium';
  isAvailable: boolean;
}

// Lab metadata for lab-based subjects
export interface Lab {
  id: string;
  name: string;
  associatedCourseId: string;
  duration: number; // in hours
  maxBatchesPerDay: number;
  totalBatches: number;
  requiredRoomType: 'lab';
}

// Subject structure (used for both fixed and optional)
export interface Subject {
  id?: string;
  name: string;
  code?: string;
  type?: 'Lecture' | 'Lab' | 'Elective';
  semester?: number;
  hoursPerWeek: number;
  facultyPerSection: {
    [section: string]: string; // e.g., { "A": "fac1", "B": "fac2" }
  };
  sections?: string[];
  hasLab?: boolean;
  labDetails?: Lab;
  isOpenElective?: boolean;
  isProfessionalElective?: boolean;
  requiredRoomType?: 'classroom' | 'lab' | 'auditorium';
  isLab?: boolean; // for dynamic form use
}

// Faculty availability
export interface Faculty {
  id: string;
  name: string;
  subjects: string[]; // Subject IDs
  unavailableSlots?: { day: string; timeSlot: string }[];
}

// Timetable grid cell (each subject slot)
export interface TimetableCell {
  subjectId?: string;
  facultyId?: string;
  roomId?: string;
  type?: 'Lecture' | 'Lab' | 'Elective' | 'Placement' | 'Break';
  batchNumber?: number;
  isConflict?: boolean;
}

// A day in the timetable (mapped by timeslot ID)
export interface TimetableDay {
  [timeSlotId: string]: TimetableCell;
}

// Complete Timetable per semester-section
export interface Timetable {
  id: string;
  semester: number;
  section: string;
  days: {
    [day: string]: TimetableDay;
  };
  timeSlots: TimeSlot[];
  rooms: Room[];
  conflicts: Conflict[];
}

// Conflict logging
export interface Conflict {
  id: string;
  type: 'room' | 'faculty' | 'time' | 'batch';
  description: string;
  affectedSlots: {
    day: string;
    timeSlot: string;
    sections: string[];
  }[];
  severity: 'high' | 'medium' | 'low';
}

// For scheduling exports and logs
export interface ScheduleSlot {
  id: string;
  day: string;
  timeRange: string;
  roomId: string;
  subjectId: string;
  sectionId: string;
  semester: number;
  facultyId: string;
  batchNumber?: number;
}

// Room-wise slot view
export interface RoomSlot {
  section: string;
  subject: string;
  faculty: string;
  day: string;
  timeSlot: string;
}