import React, { createContext, useContext, useState, useEffect } from 'react';

interface Faculty {
  id: string;
  name: string;
  maxHoursPerDay: number;
  subjects: string[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  type: 'theory' | 'lab';
  semester: string;
  facultyPerSection: { [section: string]: string };
  roomPerSection: { [section: string]: string };
}

interface Section {
  id: string;
  name: string;
  semester: string;
  batches: string[];
}

interface Room {
  id: string;
  name: string;
  type: 'class' | 'lab';
  dailyUsageLimit: number;
}

interface TimetableEntry {
  subject: string;
  faculty: string;
  room: string;
  batch?: string;
  type: 'theory' | 'lab' | 'placement';
}

interface GeneratedTimetable {
  [semester: string]: {
    [section: string]: {
      [day: string]: {
        [timeSlot: string]: TimetableEntry;
      };
    };
  };
}

interface AppContextType {
  faculty: Faculty[];
  subjects: Subject[];
  sections: Section[];
  rooms: Room[];
  timetables: GeneratedTimetable;
  conflicts: string[];
  facultyList: string[];
  facultySchedule: { [facultyId: string]: { [day: string]: { [timeSlot: string]: { semester: string; section: string; type: 'theory' | 'lab' } } } };
  setFaculty: (faculty: Faculty[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setSections: (sections: Section[]) => void;
  setRooms: (rooms: Room[]) => void;
  setTimetables: (timetables: GeneratedTimetable) => void;
  setConflicts: (conflicts: string[]) => void;
  addFaculty: (faculty: Faculty) => void;
  addSubject: (subject: Subject) => void;
  addSection: (section: Section) => void;
  addRoom: (room: Room) => void;
  updateFaculty: (id: string, faculty: Faculty) => void;
  updateSubject: (id: string, subject: Subject) => void;
  updateSection: (id: string, section: Section) => void;
  updateRoom: (id: string, room: Room) => void;
  deleteFaculty: (id: string) => void;
  deleteSubject: (id: string) => void;
  deleteSection: (id: string) => void;
  deleteRoom: (id: string) => void;
  setFacultyList: React.Dispatch<React.SetStateAction<string[]>>;
  isFacultyAvailable: (facultyId: string, day: string, timeSlot: string) => boolean;
  assignFaculty: (facultyId: string, day: string, timeSlot: string, semester: string, section: string, type: 'theory' | 'lab') => void;
  unassignFaculty: (facultyId: string, day: string, timeSlot: string) => void;
  getFacultyAssignments: (facultyId: string) => { [day: string]: { [timeSlot: string]: { semester: string; section: string; type: 'theory' | 'lab' } } };
  clearFacultySchedule: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timetables, setTimetables] = useState<GeneratedTimetable>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [facultyList, setFacultyList] = useState<string[]>([]);
  const [facultySchedule, setFacultySchedule] = useState<{ [facultyId: string]: { [day: string]: { [timeSlot: string]: { semester: string; section: string; type: 'theory' | 'lab' } } } }>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFaculty = localStorage.getItem('eduschedx-faculty');
    const savedSubjects = localStorage.getItem('eduschedx-subjects');
    const savedSections = localStorage.getItem('eduschedx-sections');
    const savedRooms = localStorage.getItem('eduschedx-rooms');
    const savedTimetables = localStorage.getItem('eduschedx-timetables');
    const savedFacultySchedule = localStorage.getItem('eduschedx-faculty-schedule');

    if (savedFaculty) setFaculty(JSON.parse(savedFaculty));
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedTimetables) setTimetables(JSON.parse(savedTimetables));
    if (savedFacultySchedule) setFacultySchedule(JSON.parse(savedFacultySchedule));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('eduschedx-faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('eduschedx-subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('eduschedx-sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('eduschedx-rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('eduschedx-timetables', JSON.stringify(timetables));
  }, [timetables]);

  useEffect(() => {
    localStorage.setItem('eduschedx-faculty-schedule', JSON.stringify(facultySchedule));
  }, [facultySchedule]);

  // Global faculty availability methods
  const isFacultyAvailable = (facultyId: string, day: string, timeSlot: string): boolean => {
    const facultyAssignments = facultySchedule[facultyId];
    if (!facultyAssignments) return true;
    
    const dayAssignments = facultyAssignments[day];
    if (!dayAssignments) return true;
    
    return !dayAssignments[timeSlot];
  };

  const assignFaculty = (facultyId: string, day: string, timeSlot: string, semester: string, section: string, type: 'theory' | 'lab') => {
    setFacultySchedule(prev => ({
      ...prev,
      [facultyId]: {
        ...prev[facultyId],
        [day]: {
          ...prev[facultyId]?.[day],
          [timeSlot]: { semester, section, type }
        }
      }
    }));
  };

  const unassignFaculty = (facultyId: string, day: string, timeSlot: string) => {
    setFacultySchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[facultyId]?.[day]?.[timeSlot]) {
        delete newSchedule[facultyId][day][timeSlot];
        if (Object.keys(newSchedule[facultyId][day]).length === 0) {
          delete newSchedule[facultyId][day];
        }
        if (Object.keys(newSchedule[facultyId]).length === 0) {
          delete newSchedule[facultyId];
        }
      }
      return newSchedule;
    });
  };

  const getFacultyAssignments = (facultyId: string) => {
    return facultySchedule[facultyId] || {};
  };

  const clearFacultySchedule = () => {
    setFacultySchedule({});
  };

  const addFaculty = (newFaculty: Faculty) => {
    setFaculty(prev => [...prev, newFaculty]);
  };

  const addSubject = (newSubject: Subject) => {
    setSubjects(prev => [...prev, newSubject]);
  };

  const addSection = (newSection: Section) => {
    setSections(prev => [...prev, newSection]);
  };

  const addRoom = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
  };

  const updateFaculty = (id: string, updatedFaculty: Faculty) => {
    setFaculty(prev => prev.map(f => f.id === id ? updatedFaculty : f));
  };

  const updateSubject = (id: string, updatedSubject: Subject) => {
    setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
  };

  const updateSection = (id: string, updatedSection: Section) => {
    setSections(prev => prev.map(s => s.id === id ? updatedSection : s));
  };

  const updateRoom = (id: string, updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r));
  };

  const deleteFaculty = (id: string) => {
    setFaculty(prev => prev.filter(f => f.id !== id));
    // Also remove from faculty schedule
    setFacultySchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[id];
      return newSchedule;
    });
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        faculty,
        subjects,
        sections,
        rooms,
        timetables,
        conflicts,
        facultyList,
        facultySchedule,
        setFaculty,
        setSubjects,
        setSections,
        setRooms,
        setTimetables,
        setConflicts,
        addFaculty,
        addSubject,
        addSection,
        addRoom,
        updateFaculty,
        updateSubject,
        updateSection,
        updateRoom,
        deleteFaculty,
        deleteSubject,
        deleteSection,
        deleteRoom,
        setFacultyList,
        isFacultyAvailable,
        assignFaculty,
        unassignFaculty,
        getFacultyAssignments,
        clearFacultySchedule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};