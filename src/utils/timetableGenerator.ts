import { Timetable, Subject, TimeSlot, Room, Conflict, ScheduleSlot } from '../types/timetable';

interface GeneratorParams {
  basicSettings: {
    semester: number;
    sections: string[];
    workingDays: string[];
    startTime: string;
    endTime: string;
    lunchBreakStart: string;
    lunchBreakEnd: string;
  };
  rooms: Room[];
  subjects: Subject[];
  constraints: {
    allowPlacementHours: boolean;
    placementDays: string[];
    placementHours: string;
    avoidBackToBack: boolean;
    sixthSemFreeSaturday: boolean;
    mhLabConstraints?: {
      maxBatchesPerDay: number;
      totalBatches: number;
      minDaysRequired: number;
    };
    sixthSemElectives?: {
      openElectiveSlots: { day: string; time: string }[];
      professionalElectiveSameTime: boolean;
    };
  };
}

// Helper function to generate time slots from start/end times
const generateTimeSlots = (startTime: string, endTime: string, lunchStart: string, lunchEnd: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  const convertToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const convertToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };
  
  const start = convertToMinutes(startTime);
  const end = convertToMinutes(endTime);
  const lunchStartMins = convertToMinutes(lunchStart);
  const lunchEndMins = convertToMinutes(lunchEnd);
  
  // Create 1-hour slots
  for (let timeInMinutes = start; timeInMinutes < end; timeInMinutes += 60) {
    // Skip lunch break
    if (timeInMinutes === lunchStartMins) {
      slots.push({
        id: `slot-${slots.length + 1}`,
        startTime: lunchStart,
        endTime: lunchEnd,
      });
      timeInMinutes = lunchEndMins - 60; // Adjust to continue after lunch
      continue;
    }
    
    const startTimeFormatted = convertToTimeString(timeInMinutes);
    const endTimeFormatted = convertToTimeString(timeInMinutes + 60);
    
    slots.push({
      id: `slot-${slots.length + 1}`,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
    });
  }
  
  return slots;
};

// Conflict detection functions
const detectRoomConflicts = (schedules: ScheduleSlot[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  const roomTimeMap = new Map<string, ScheduleSlot[]>();
  
  // Group schedules by room and time
  schedules.forEach(schedule => {
    const key = `${schedule.roomId}-${schedule.day}-${schedule.timeRange}`;
    if (!roomTimeMap.has(key)) {
      roomTimeMap.set(key, []);
    }
    roomTimeMap.get(key)!.push(schedule);
  });
  
  // Check for conflicts
  roomTimeMap.forEach((scheduleList, key) => {
    if (scheduleList.length > 1) {
      conflicts.push({
        id: `room-conflict-${conflicts.length + 1}`,
        type: 'room',
        description: `Room ${scheduleList[0].roomId} has multiple bookings`,
        affectedSlots: [{
          day: scheduleList[0].day,
          timeSlot: scheduleList[0].timeRange,
          sections: scheduleList.map(s => s.sectionId)
        }],
        severity: 'high'
      });
    }
  });
  
  return conflicts;
};

const detectFacultyConflicts = (schedules: ScheduleSlot[], subjects: Subject[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  const facultyTimeMap = new Map<string, ScheduleSlot[]>();
  
  // Create faculty mapping
  const subjectFacultyMap = new Map<string, string>();
  subjects.forEach(subject => {
    subjectFacultyMap.set(subject.id || '', subject.facultyPerSection && subject.facultyPerSection['A'] ? subject.facultyPerSection['A'] : '');
  });
  
  // Group schedules by faculty and time
  schedules.forEach(schedule => {
    const faculty = subjectFacultyMap.get(schedule.subjectId);
    if (faculty) {
      const key = `${faculty}-${schedule.day}-${schedule.timeRange}`;
      if (!facultyTimeMap.has(key)) {
        facultyTimeMap.set(key, []);
      }
      facultyTimeMap.get(key)!.push(schedule);
    }
  });
  
  // Check for conflicts
  facultyTimeMap.forEach((scheduleList, key) => {
    if (scheduleList.length > 1) {
      const faculty = key.split('-')[0];
      conflicts.push({
        id: `faculty-conflict-${conflicts.length + 1}`,
        type: 'faculty',
        description: `Faculty ${faculty} has multiple classes scheduled`,
        affectedSlots: [{
          day: scheduleList[0].day,
          timeSlot: scheduleList[0].timeRange,
          sections: scheduleList.map(s => s.sectionId)
        }],
        severity: 'high'
      });
    }
  });
  
  return conflicts;
};

// Lab scheduling with batch constraints
const scheduleLabSessions = (
  subjects: Subject[],
  timeSlots: TimeSlot[],
  rooms: Room[],
  workingDays: string[],
  constraints: GeneratorParams['constraints'],
  facultyList?: { id: string; name: string; maxHoursPerDay: number; unavailableSlots?: { day: string; timeSlot: string }[] }[]
): ScheduleSlot[] => {
  const labSchedules: ScheduleSlot[] = [];
  const labRooms = rooms.filter(room => room.type === 'lab');

  // Track room and faculty assignments per day and time
  const roomAssignments: { [key: string]: Set<string> } = {}; // key: day-time, value: Set<roomId>
  const facultyAssignments: { [key: string]: Set<string> } = {}; // key: day-time, value: Set<facultyId>
  const facultyHours: { [facultyId: string]: { [day: string]: number } } = {};

  // Helper to get available faculty for a slot
  function getAvailableFaculty(day: string, timeRange: string): string | null {
    if (!facultyList || facultyList.length === 0) return null;
    for (const fac of facultyList) {
      // Check if already assigned at this slot
      const key = `${day}-${timeRange}`;
      if (facultyAssignments[key] && facultyAssignments[key].has(fac.id)) continue;
      // Check max hours per day
      if (facultyHours[fac.id]?.[day] >= fac.maxHoursPerDay) continue;
      // Check unavailable slots
      if (fac.unavailableSlots && fac.unavailableSlots.some(s => s.day === day && s.timeSlot === timeRange)) continue;
      return fac.id;
    }
    return null;
  }

  subjects.forEach(subject => {
    if (subject.hasLab && subject.labDetails) {
      const lab = subject.labDetails;
      // For each batch
      for (let batch = 1; batch <= lab.totalBatches; batch++) {
        // Assign day and time slot (round-robin for demo)
        const day = workingDays[(batch - 1) % workingDays.length];
        const slot = timeSlots[(batch - 1) % timeSlots.length];
        const timeRange = `${slot.startTime}-${slot.endTime}`;
        const key = `${day}-${timeRange}`;
        // Assign lab room
        let roomId = '';
        if (subject.name.toLowerCase().includes('ld') && (typeof subject.semester === 'number' ? subject.semester === 3 : String(subject.semester) === '3')) {
          // Always assign the designated LD lab (by name)
          const ldLab = labRooms.find(r => r.name.toLowerCase().includes('ld'));
          if (ldLab) roomId = ldLab.id;
          else roomId = labRooms[0]?.id || '';
        } else {
          // Find a lab not already assigned at this slot
          const assigned = roomAssignments[key] || new Set();
          const availableLab = labRooms.find(r => !assigned.has(r.id));
          roomId = availableLab ? availableLab.id : labRooms[0]?.id || '';
        }
        // Mark room as assigned
        if (!roomAssignments[key]) roomAssignments[key] = new Set();
        roomAssignments[key].add(roomId);
        // Assign faculty
        let facultyId = subject.facultyPerSection && subject.facultyPerSection['A'] ? subject.facultyPerSection['A'] : '';
        if (facultyList && facultyList.length > 0) {
          const availableFaculty = getAvailableFaculty(day, timeRange);
          if (availableFaculty) facultyId = availableFaculty;
        }
        facultyId = facultyId || '';
        // Mark faculty as assigned
        if (!facultyAssignments[key]) facultyAssignments[key] = new Set();
        facultyAssignments[key].add(facultyId);
        // Track faculty hours
        if (!facultyHours[facultyId]) facultyHours[facultyId] = {};
        if (!facultyHours[facultyId][day]) facultyHours[facultyId][day] = 0;
        // Parse time for hour calculation
        const startHour = parseInt(slot.startTime.split(':')[0], 10) || 0;
        const endHour = parseInt(slot.endTime.split(':')[0], 10) || 0;
        facultyHours[facultyId][day] += (endHour - startHour);
        // Add to schedule
        labSchedules.push({
          id: `lab-schedule-${labSchedules.length + 1}`,
          day: day || '',
          timeRange: timeRange || '',
          roomId: roomId || '',
          subjectId: subject.id || '',
          sectionId: 'A', // Simplified
          semester: typeof subject.semester === 'number' ? subject.semester : parseInt(subject.semester ? String(subject.semester) : '0', 10),
          facultyId: facultyId || '',
          batchNumber: batch
        });
      }
    }
  });

  return labSchedules;
};

// Elective scheduling for 6th semester
const scheduleElectives = (
  subjects: Subject[],
  timeSlots: TimeSlot[],
  rooms: Room[],
  sections: string[],
  constraints: GeneratorParams['constraints']
): ScheduleSlot[] => {
  const electiveSchedules: ScheduleSlot[] = [];
  
  if (constraints.sixthSemElectives) {
    const { openElectiveSlots, professionalElectiveSameTime } = constraints.sixthSemElectives;
    const classrooms = rooms.filter(room => room.type === 'classroom');
    
    // Schedule open electives
    const openElectives = subjects.filter(s => s.isOpenElective);
    openElectives.forEach((subject, index) => {
      openElectiveSlots.forEach(slot => {
        sections.forEach((section, sectionIndex) => {
          const room = classrooms[sectionIndex % classrooms.length];
          
          electiveSchedules.push({
            id: `open-elective-${electiveSchedules.length + 1}`,
            day: slot.day,
            timeRange: slot.time,
            roomId: room.id,
            subjectId: subject.id,
            sectionId: section,
            semester: subject.semester,
            facultyId: subject.faculty
          });
        });
      });
    });
    
    // Schedule professional electives
    const professionalElectives = subjects.filter(s => s.isProfessionalElective);
    if (professionalElectiveSameTime && professionalElectives.length > 0) {
      const commonTimeSlot = timeSlots[0]; // Simplified - use first available slot
      
      professionalElectives.forEach((subject, index) => {
        sections.forEach((section, sectionIndex) => {
          const room = classrooms[(index + sectionIndex) % classrooms.length];
          
          electiveSchedules.push({
            id: `prof-elective-${electiveSchedules.length + 1}`,
            day: 'Wednesday', // Fixed day for professional electives
            timeRange: `${commonTimeSlot.startTime}-${commonTimeSlot.endTime}`,
            roomId: room.id,
            subjectId: subject.id,
            sectionId: section,
            semester: subject.semester,
            facultyId: subject.faculty
          });
        });
      });
    }
  }
  
  return electiveSchedules;
};

// --- UPDATED: Schedule theory (user-added) subjects, avoiding fixed lab slots ---
const scheduleTheorySubjects = (
  subjects: Subject[],
  timeSlots: TimeSlot[],
  rooms: Room[],
  workingDays: string[],
  constraints: GeneratorParams['constraints'],
  labSchedules: ScheduleSlot[], // <-- pass lab assignments here
  facultyList?: { id: string; name: string; maxHoursPerDay: number; unavailableSlots?: { day: string; timeSlot: string }[] }[]
): ScheduleSlot[] => {
  const theorySchedules: ScheduleSlot[] = [];
  const classroomRooms = rooms.filter(room => room.type === 'class' || room.type === 'classroom');

  // Track room and faculty assignments per day and time
  const roomAssignments: { [key: string]: Set<string> } = {}; // key: day-time, value: Set<roomId>
  const facultyAssignments: { [key: string]: Set<string> } = {}; // key: day-time, value: Set<facultyId>
  const facultyHours: { [facultyId: string]: { [day: string]: number } } = {};
  // Track subject scheduled days to avoid repeating same subject twice a day
  const subjectDayAssignments: { [subjectId: string]: Set<string> } = {};
  // Track lab-occupied slots: key = day-section-time
  const labOccupiedSlots: { [key: string]: boolean } = {};
  labSchedules.forEach(lab => {
    const key = `${lab.day}-${lab.sectionId}-${lab.timeRange}`;
    labOccupiedSlots[key] = true;
  });

  // Helper to get available faculty for a slot
  function getAvailableFaculty(day: string, timeRange: string, facultyId: string): boolean {
    if (!facultyId) return false;
    // Check if already assigned at this slot
    const key = `${day}-${timeRange}`;
    if (facultyAssignments[key] && facultyAssignments[key].has(facultyId)) return false;
    // Check max hours per day
    if (facultyHours[facultyId]?.[day] >= 6) return false; // Default max 6 hours/day
    return true;
  }

  // Only schedule theory subjects (not labs, not electives)
  const theorySubjects = subjects.filter(s => (
    (s.type === 'theory' || s.type === 'Lecture' || (!s.type && !s.hasLab && !s.isOpenElective && !s.isProfessionalElective))
  ));

  console.log('[Timetable Debug] Theory subjects to schedule:', theorySubjects.map(s => ({ id: s.id, name: s.name, sections: s.sections })));

  theorySubjects.forEach(subject => {
    // For each section
    (subject.sections || ['A']).forEach(section => {
      let hoursScheduled = 0;
      subjectDayAssignments[subject.id || ''] = new Set();
      // Try to schedule 4 hours/week, max 1 per day
      for (const day of workingDays) {
        if (hoursScheduled >= 4) break;
        // Avoid scheduling same subject twice a day
        if (subjectDayAssignments[subject.id || ''].has(day)) continue;
        let scheduled = false;
        for (const slot of timeSlots) {
          const timeRange = `${slot.startTime}-${slot.endTime}`;
          const key = `${day}-${timeRange}`;
          const labKey = `${day}-${section}-${timeRange}`;
          // ENFORCE: Skip if this slot is occupied by a lab for this section and day
          if (labOccupiedSlots[labKey]) {
            continue;
          }
          // Find available classroom
          const assigned = roomAssignments[key] || new Set();
          const availableRoom = classroomRooms.find(r => !assigned.has(r.id));
          // Find assigned faculty for this section
          const facultyId = subject.facultyPerSection && subject.facultyPerSection[section] ? subject.facultyPerSection[section] : '';
          if (availableRoom && getAvailableFaculty(day, timeRange, facultyId)) {
            // Mark room and faculty as assigned
            if (!roomAssignments[key]) roomAssignments[key] = new Set();
            roomAssignments[key].add(availableRoom.id);
            if (!facultyAssignments[key]) facultyAssignments[key] = new Set();
            facultyAssignments[key].add(facultyId);
            if (!facultyHours[facultyId]) facultyHours[facultyId] = {};
            if (!facultyHours[facultyId][day]) facultyHours[facultyId][day] = 0;
            facultyHours[facultyId][day] += 1;
            // Mark subject as scheduled for this day
            subjectDayAssignments[subject.id || ''].add(day);
            // Add to schedule
            theorySchedules.push({
              id: `theory-schedule-${theorySchedules.length + 1}`,
              day: day ? String(day) : '',
              timeRange: timeRange ? String(timeRange) : '',
              roomId: availableRoom && availableRoom.id ? String(availableRoom.id) : '',
              subjectId: subject && subject.id ? String(subject.id) : '',
              sectionId: section ? String(section) : '',
              semester: typeof subject.semester === 'number' ? subject.semester : (subject.semester ? Number(subject.semester) : 0),
              facultyId: facultyId ? String(facultyId) : '',
              batchNumber: undefined
            });
            hoursScheduled++;
            scheduled = true;
            console.log(`[Timetable Debug] Scheduled subject ${subject.name} section ${section} on ${day} ${timeRange} in room ${availableRoom.id}`);
            break;
          } else {
            if (!availableRoom) {
              console.log(`[Timetable Debug] No available classroom for subject ${subject.name} section ${section} on ${day} ${timeRange}`);
            } else if (!getAvailableFaculty(day, timeRange, facultyId)) {
              console.log(`[Timetable Debug] Faculty not available for subject ${subject.name} section ${section} on ${day} ${timeRange}`);
            }
          }
        }
        if (scheduled) continue;
      }
      if (hoursScheduled < 4) {
        console.warn(`[Timetable Debug] Could not schedule all 4 hours for subject ${subject.name} section ${section}. Scheduled: ${hoursScheduled}`);
      }
    });
  });

  console.log('[Timetable Debug] Total theory assignments made:', theorySchedules.length);

  return theorySchedules;
};

// Main timetable generation function
export const generateTimetable = async (params: GeneratorParams): Promise<Timetable> => {
  const { basicSettings, rooms, subjects, constraints } = params;
  
  // Generate time slots
  const timeSlots = generateTimeSlots(
    basicSettings.startTime,
    basicSettings.endTime,
    basicSettings.lunchBreakStart,
    basicSettings.lunchBreakEnd
  );
  
  // Schedule lab sessions first (highest priority)
  const labSchedules = scheduleLabSessions(subjects, timeSlots, rooms, basicSettings.workingDays, constraints);
  
  // Schedule theory subjects (user-added), avoiding lab slots
  const theorySchedules = scheduleTheorySubjects(subjects, timeSlots, rooms, basicSettings.workingDays, constraints, labSchedules);

  // Schedule electives (6th semester specific)
  const electiveSchedules = scheduleElectives(subjects, timeSlots, rooms, basicSettings.sections, constraints);
  
  // Combine all schedules
  const allSchedules = [...labSchedules, ...theorySchedules, ...electiveSchedules];
  
  // Detect conflicts
  const roomConflicts = detectRoomConflicts(allSchedules);
  const facultyConflicts = detectFacultyConflicts(allSchedules, subjects);
  const allConflicts = [...roomConflicts, ...facultyConflicts];
  
  // Create the timetable structure
  const timetable: Timetable = {
    id: `timetable-${basicSettings.semester}-${basicSettings.sections[0]}`,
    semester: basicSettings.semester,
    section: basicSettings.sections[0],
    days: {},
    timeSlots,
    rooms,
    conflicts: allConflicts,
  };
  
  // Initialize each day
  basicSettings.workingDays.forEach(day => {
    // Skip Saturday for 6th semester if constraint is enabled
    if (constraints.sixthSemFreeSaturday && basicSettings.semester === 6 && day === 'Saturday') {
      return;
    }
    
    timetable.days[day] = {};
    
    // Initialize each time slot
    timeSlots.forEach(slot => {
      timetable.days[day][slot.id] = {};
    });
  });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return timetable;
};