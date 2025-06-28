import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
(jsPDF as any).autoTable = autoTable;
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '9:30–10:30', '10:30–11:30', '11:30–12:30', '12:30–1:30',
  '1:30–2:30', '2:30–3:30', '3:30–4:30'
];
const LAB_BLOCKS = [[0, 1], [1, 2], [5, 6]];
const LUNCH_INDEX = 4; // Corresponds to the 1:30-2:30 slot which is skipped

const FIXED_SUBJECTS: Record<string, any[]> = {
  '1': [
    { name: 'Maths', isLab: false, weekly: 4 },
    { name: 'Physics', isLab: false, weekly: 4 },
  ],
  '3': [
    { name: 'Maths', isLab: false, weekly: 4 }
  ],
  '5':[],
  
  '7': []
};

type LabSlot = {
  section: string,
  day: string,
  start: string,
  end: string,
  subject: string
};

// INTEGRATE the data directly here:
const fixedLabSlots: Record<string, Record<string, Record<string, string[]>>> = {
  "1st": {
    "A": {
      "Monday_9:30–11:30": ["C_A1", "Phy_A2"],
      "Wednesday_2:30–3:30": ["C_A2", "Phy_A1"],
      "Thursday_11:30–1:30": ["Matlab_Full_Asec"]
    },
    "B": {
      "Monday_11:30–1:30": ["C_B1", "Phy_B2"],
      "Wednesday_9:30–11:30": ["C_B2", "Phy_B1"],
      "Tuesday_2:30–4:30": ["Matlab_Full_Bsec"]
    },
    "C": {
      "Tuesday_9:30–11:30": ["C_C1", "Phy_C2"],
      "Thursday_2:30–4:30": ["Clab_C2", "Phy_C1"],
      "Wednesday_11:30–1:30": ["Matlab_Full_Csec"]
    },
    "D": {
      "Monday_9:30–11:30": ["C_D2", "Phy_D1"],
      "Thursday_2:30–4:30": ["Matlab_Full_DSec"],
      "Friday_2:30–4:30": ["Clab_D1", "Phy_D2"]
    }
  },
  "3rd": {
    "A": {
      "Monday_2:30–4:30": ["DS_A3", "OOPS_A2", "LD_A1"],
      "Tuesday_9:30–11:30": ["DS_A3", "DS_A2", "OOPS_A3", "OOPS_A5", "LD_A4"],
      "Wednesday_2:30–4:30": ["DS_A4", "DS_A5", "OOPS_A1", "LD_A2"],
      "Friday_2:30–4:30": ["OOPS_A4", "LD_A3", "LD_A5"]
    },
    "B": {
      "Tuesday_2:30–4:30": ["DS_B2", "DS_B4", "OOPS_B2", "LD_B1"],
      "Wednesday_11:30–1:30": ["DS_B1", "DS_B2", "OOPS_B4", "OOPS_B5", "LD_B3"],
      "Friday_9:30–11:30": ["DS_B5", "OOPS_B1", "OOPS_B3", "LD_B2", "LD_B4"],
      "Saturday_11:30–1:30": ["LD_B5"]
    },
    "C": {
      "Monday_9:30–11:30": ["DS_C3", "OOPS_C2", "LD_C1", "LD_C4"],
      "Thursday_2:30–4:30": ["DS_C2", "OOPS_C4", "LD_C9"],
      "Friday_11:30–1:30": ["DS_C4", "DS_C5", "OOPS_C1", "LD_C3"],
      "Saturday_9:30–11:30": ["DS_C1", "OOPS_C3", "DS_C5", "LD_C2"]
    }
  },
  "5th": {
    "A": {
      "Monday_9:30–11:30": ["OS_A4", "OS_A5", "CN_A1", "CN_A2"],
      "Tuesday_2:30–4:30": ["OS_A1", "OS_A2", "OS_A3"],
      "Friday_11:30–1:30": ["CN_A3", "CN_A4", "CN_A5"]
    },
    "B": {
      "Tuesday_2:30–4:30": ["CN_C5"],
      "Wednesday_2:30–4:30": ["CN_B1", "CN_B2", "CN_B3"],
      "Thursday_11:30–1:30": ["OS_B1", "OS_B2", "OS_B3", "CN_B4", "CN_B5"],
      "Friday_9:30–11:30": ["OS_B4", "OS_B5"]
    },
    "C": {
      "Thursday_9:30–11:30": ["OS_C1", "OS_C2", "OS_C3", "OS_C4", "OS_C5"],
      "Friday_2:30–4:30": ["CN_C1", "CN_C2", "CN_C3", "CN_C4"]
    }
  },
  "7th": {
    "A": {
      "Thursday_2:30–4:30": ["ML_A3", "ML_A4"],
      "Saturday_11:30–1:30": ["ML_A1", "ML_A2"]
    },
    "B": {
      "Tuesday_2:30–4:30": ["ML_B1", "ML_B2", "ML_B3", "ML_B4"]
    }
  }
};

const fixedTheorySubjects: Record<string, Record<string, Record<string, string[]>>> = {
  "5th": {
    "A": {
      "Wednesday_12:30–1:30": ["PE"],
      "Tuesday_9:30–10:30": ["PE"],
      "Friday_9:30–10:30": ["PE"]
    },
    "B": {
      "Wednesday_12:30–1:30": ["PE"],
      "Tuesday_9:30–10:30": ["PE"],
      "Friday_9:30–10:30": ["PE"]
    },
    "C": {
      "Wednesday_12:30–1:30": ["PE"],
      "Tuesday_9:30–10:30": ["PE"],
      "Friday_9:30–10:30": ["PE"]
    },
    "D": {
      "Wednesday_12:30–1:30": ["PE"],
      "Tuesday_9:30–10:30": ["PE"],
      "Friday_9:30–10:30": ["PE"]
    }
  },
  "7th": {
    "A": {
      "Tuesday_10:30–11:30": ["GEN.AI", "AG VR"],
      "Thursday_9:30–10:30": ["GEN.AI", "AG VR"],
      "Friday_11:30–12:30": ["GEN.AI", "AG VR"],
      "Tuesday_9:30–10:30": ["CY-SEC"],
      "Wednesday_11:30–12:30": ["CY-SEC"],
      "Thursday_10:30–11:30": ["CY-SEC"],
      "Friday_12:30–1:30": ["CY-SEC"]
    },
    "B": {
      "Tuesday_10:30–11:30": ["GEN.AI", "AG VR"],
      "Thursday_9:30–10:30": ["GEN.AI", "AG VR"],
      "Friday_11:30–12:30": ["GEN.AI", "AG VR"],
      "Tuesday_9:30–10:30": ["CY-SEC"],
      "Wednesday_11:30–12:30": ["CY-SEC"],
      "Thursday_10:30–11:30": ["CY-SEC"],
      "Friday_12:30–1:30": ["CY-SEC"]
    },
    "C": {
      "Tuesday_10:30–11:30": ["GEN.AI", "AG VR"],
      "Thursday_9:30–10:30": ["GEN.AI", "AG VR"],
      "Friday_11:30–12:30": ["GEN.AI", "AG VR"],
      "Tuesday_9:30–10:30": ["CY-SEC"],
      "Wednesday_11:30–12:30": ["CY-SEC"],
      "Thursday_10:30–11:30": ["CY-SEC"],
      "Friday_12:30–1:30": ["CY-SEC"]
    },
    "D": {
      "Tuesday_10:30–11:30": ["GEN.AI", "AG VR"],
      "Thursday_9:30–10:30": ["GEN.AI", "AG VR"],
      "Friday_11:30–12:30": ["GEN.AI", "AG VR"],
      "Tuesday_9:30–10:30": ["CY-SEC"],
      "Wednesday_11:30–12:30": ["CY-SEC"],
      "Thursday_10:30–11:30": ["CY-SEC"],
      "Friday_12:30–1:30": ["CY-SEC"]
    }
  }
};

const fixedTheorySubjectsList: Record<string, string[]> = {
  '1st': ['Maths', 'Physics','DesignThinking', 'electronics' ], // Example, update as needed
  '3rd': ['Maths3', ],   // Example, update as needed
};

function getSlotIndices(start: string, end: string) {
  const startIdx = TIME_SLOTS.findIndex(t => t === start);
  // Find the index of the slot that *ends with* the given 'end' time.
  const endIdx = TIME_SLOTS.findIndex(t => t.endsWith(end));

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`Could not find valid time slot indices for start: "${start}" and end: "${end}". This slot will be skipped.`);
    return [];
  }

  const indices = [];
  for (let i = startIdx; i <= endIdx; i++) {
    if (i === LUNCH_INDEX) continue; // skip lunch
    indices.push(i);
  }
  return indices;
}


const PLACEMENT_CLASSES: Record<string, any> = {
  '1': { name: 'Placement Training', isLab: false, weekly: 2 },
  '3': { name: 'Placement Training', isLab: false, weekly: 2 },
  '5': { name: 'Placement Training', isLab: false, weekly: 2 },
  '7': { name: 'Placement Training', isLab: false, weekly: 2 }
};

const TimetableGenerator: React.FC = () => {
  const { sections, rooms, subjects, faculty, isFacultyAvailable, assignFaculty } = useApp();
  const [semester, setSemester] = useState('1');
  const [timetables, setTimetables] = useState<Record<string, any>>({});
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [placementEnabled, setPlacementEnabled] = useState<Record<string, boolean>>({
    '1': false, '3': false, '5': false, '7': false
  });
  const [freeDay, setFreeDay] = useState<string>('none');
  const [includeSaturday, setIncludeSaturday] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const navigate = useNavigate();

  const DAYS_TO_USE = includeSaturday ? ALL_DAYS : ALL_DAYS.slice(0, 5);

  // Semester mapping for proper matching
  const semesterMap: { [key: string]: string } = {
    '1': '1st',
    '3': '3rd', 
    '5': '5th',
    '7': '7th'
  };

  // Only use sections for the selected semester
  const filteredSections = sections.filter(section => section.semester === semesterMap[semester]);

  // Utility
  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
  function getRandomOrder<T>(arr: T[]): T[] {
    return arr.map(a => [Math.random(), a] as [number, T]).sort((a, b) => a[0] - b[0]).map(([_, a]) => a);
  }

  // Generate for current semester only
  const generate = () => {
    // Check prerequisites - allow generation even without user subjects (for fixed labs/theory only)
    if (!filteredSections || filteredSections.length === 0 || !rooms || rooms.length === 0) {
      setWarningMessage('Please ensure sections and rooms are added for this semester before generating.');
      setTimeout(() => setWarningMessage(''), 4000);
      return;
    }
    console.log("Generate button clicked");
    const timetable: any = {};
    const conflictLog: string[] = [];
    const facultySectionMap: any = {};
    const roomAssignment: any = {};
    
    // Convert numeric semester to string format for proper matching
    const semesterString = semesterMap[semester];
    
    // Filter subjects for current semester only
    const semesterSubjects = subjects.filter(s => s.semester === semesterString);
    const userInputTheorySubjects = semesterSubjects.filter(s => s.type === 'theory');
    
    console.log('Current semester (numeric):', semester);
    console.log('Current semester (string):', semesterString);
    console.log('All subjects:', subjects);
    console.log('Filtered sections:', filteredSections);
    console.log('Semester subjects:', semesterSubjects);
    console.log('User input theory subjects:', userInputTheorySubjects);
    console.log('Fixed lab slots for semester:', fixedLabSlots[semesterString]);
    console.log('Fixed theory subjects for semester:', fixedTheorySubjects[semesterString]);

    // 1. Initialize timetable grid for each section
    filteredSections.forEach((section, idx) => {
      const grid = DAYS_TO_USE.map(() => {
        const row = Array(TIME_SLOTS.length).fill('');
        row[LUNCH_INDEX] = 'Lunch Break';
        return row;
      });
      timetable[section.name] = grid;
      // Room assignment is just for display; no usage limit
      roomAssignment[section.name] = rooms.map(room => room.name)[idx % rooms.length] || `Room-${idx + 1}`;
    });

    // Global faculty schedule for overlap prevention
    const globalFacultySchedule: { [facultyId: string]: { [day: string]: { [slot: string]: true } } } = {};
    // Helper to check global faculty availability
    function isFacultyGloballyAvailable(facultyId: string, day: string, slot: string) {
      return !globalFacultySchedule[facultyId]?.[day]?.[slot];
    }
    // Helper to mark global faculty assignment
    function assignFacultyGlobally(facultyId: string, day: string, slot: string) {
      if (!globalFacultySchedule[facultyId]) globalFacultySchedule[facultyId] = {};
      if (!globalFacultySchedule[facultyId][day]) globalFacultySchedule[facultyId][day] = {};
      globalFacultySchedule[facultyId][day][slot] = true;
    }

    // 2. STEP 1: Allot Fixed Lab Batches (using fixedLabSlots) - FIRST PRIORITY
    console.log('=== STEP 1: Allotting Fixed Lab Batches ===');
    if (fixedLabSlots[semesterString]) {
      filteredSections.forEach(section => {
        const secName = section.name;
        const secLabs = fixedLabSlots[semesterString][secName];
        if (!secLabs) {
          console.log('No fixed labs for section:', secName, 'semester:', semesterString);
          return;
        }
        console.log(`Processing fixed labs for section ${secName}:`, secLabs);
        Object.entries(secLabs).forEach(([dayTime, subjects]) => {
          console.log('Mapping fixed lab:', { section: secName, dayTime, subjects });
          // dayTime is like 'Monday_9:30–11:30'
          const [day, time] = dayTime.split('_');
          const dayIdx = DAYS_TO_USE.findIndex(d => d.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)));
          if (dayIdx === -1) {
            console.log('Day not found in DAYS_TO_USE:', day);
            return;
          }
          // Find the slot indices that match the block
          const [blockStart, blockEnd] = time.split('–');
          const normalize = (s: string) => s.replace(/[^0-9]/g, '');
          const blockStartNum = parseInt(normalize(blockStart));
          const blockEndNum = parseInt(normalize(blockEnd));
          let firstSlot = -1;
          let lastSlot = -1;
          TIME_SLOTS.forEach((slot, slotIdx) => {
            if (slotIdx === LUNCH_INDEX) return;
            const [slotStart, slotEnd] = slot.split('–');
            const slotStartNum = parseInt(normalize(slotStart));
            const slotEndNum = parseInt(normalize(slotEnd));
            if (slotStartNum === blockStartNum) firstSlot = slotIdx;
            if (slotEndNum === blockEndNum) lastSlot = slotIdx;
          });
          if (firstSlot !== -1) {
            timetable[secName][dayIdx][firstSlot] = `${(subjects as string[]).join(', ')} (Fixed Lab)`;
            // Fill the following slots in the block with a marker for highlighting
            for (let slotIdx = firstSlot + 1; slotIdx <= lastSlot; slotIdx++) {
              if (slotIdx === LUNCH_INDEX) continue;
              timetable[secName][dayIdx][slotIdx] = '(Lab Block)';
            }
            console.log('Filled fixed lab block:', { section: secName, dayIdx, firstSlot, lastSlot, value: timetable[secName][dayIdx][firstSlot] });
          } else {
            console.log('Could not find matching slot for fixed lab block:', { section: secName, day, time });
          }
        });
      });
    } else {
      console.log('No fixed lab slots found for semester:', semesterString);
    }

    // 3. STEP 2: Allot Fixed Theory Subjects (from fixedTheorySubjects) - SECOND PRIORITY
    console.log('=== STEP 2: Allotting Fixed Theory Subjects ===');
    if (fixedTheorySubjects[semesterString]) {
      filteredSections.forEach(section => {
        const secName = section.name;
        const secFixed = fixedTheorySubjects[semesterString][secName];
        if (!secFixed) return;
        console.log(`Processing fixed theory for section ${secName}:`, secFixed);
        Object.entries(secFixed).forEach(([dayTime, subjects]) => {
          // dayTime is like 'Tuesday_9:30–10:30'
          const [day, time] = dayTime.split('_');
          const dayIdx = DAYS_TO_USE.findIndex(d => d.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)));
          const slotIdx = TIME_SLOTS.findIndex(t => t === time);
          if (dayIdx === -1 || slotIdx === -1) {
            console.log('Day or time not found:', { day, time, dayIdx, slotIdx });
            return;
          }
          // Only fill if slot is empty (not already filled by fixed lab)
          if (!timetable[secName][dayIdx][slotIdx]) {
            timetable[secName][dayIdx][slotIdx] = `${(subjects as string[]).join(', ')} (Fixed Theory)`;
            console.log('Filled fixed theory slot:', { section: secName, dayIdx, slotIdx, value: timetable[secName][dayIdx][slotIdx] });
          } else {
            console.log('Slot already filled by fixed lab, skipping fixed theory:', { section: secName, dayIdx, slotIdx });
          }
        });
      });
    } else {
      console.log('No fixed theory subjects found for semester:', semesterString);
    }

    // 3.5. STEP 2.5: Allot Floating Fixed Theory Subjects (4/week, no fixed time)
    console.log('=== STEP 2.5: Allotting Floating Fixed Theory Subjects ===');
    if (fixedTheorySubjectsList[semesterString]) {
      console.log('Floating fixed theory subjects for semester:', fixedTheorySubjectsList[semesterString]);
      filteredSections.forEach(section => {
        const grid = timetable[section.name];
        const sectionRoom = roomAssignment[section.name];
        
        fixedTheorySubjectsList[semesterString].forEach(subjectName => {
          let remaining = 4;
          const daysOrder = getRandomOrder([...Array(DAYS_TO_USE.length).keys()]);
          let usedDays: number[] = [];
          let placedCount = 0;
          
          // Find if a user-input subject with this name exists for faculty assignment
          const userSubject = userInputTheorySubjects.find(s => 
            s.name.trim().toLowerCase() === subjectName.trim().toLowerCase()
          );
          let facultyName = '';
          if (userSubject?.facultyPerSection?.[section.name]) {
            const facultyObj = faculty.find(f => f.id === userSubject.facultyPerSection[section.name]);
            if (facultyObj) facultyName = facultyObj.name;
          }
          
          console.log(`Placing floating subject ${subjectName} for section ${section.name} (${remaining} slots)`);
          
          for (let i = 0; i < remaining; i++) {
            let placed = false;
            
            for (const dayIdx of daysOrder) {
              if (usedDays.includes(dayIdx)) continue; // Only one per day
              
              // Check slots in order (morning first)
              for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
                if (slotIdx === LUNCH_INDEX || grid[dayIdx][slotIdx]) continue;
                if (DAYS_TO_USE[dayIdx] === 'Sat' && slotIdx > 4) continue;
                
                const label = subjectName + (facultyName ? ` (${facultyName})` : '') + ' (Floating Fixed)';
                grid[dayIdx][slotIdx] = label;
                usedDays.push(dayIdx);
                placed = true;
                placedCount++;
                
                console.log(`✓ Placed ${subjectName} at ${DAYS_TO_USE[dayIdx]} ${TIME_SLOTS[slotIdx]}`);
                break;
              }
              if (placed) break;
            }
            
            if (!placed) {
              const errorMsg = `Could not place ${subjectName} (Floating Fixed) for ${section.name} - slot ${i + 1}`;
              conflictLog.push(`❌ ${errorMsg}`);
              console.warn(errorMsg);
            }
          }
          
          if (placedCount < remaining) {
            console.warn(`⚠️ Only placed ${placedCount}/${remaining} slots for floating subject ${subjectName} in section ${section.name}`);
          } else {
            console.log(`✓ Successfully placed all ${placedCount} slots for ${subjectName} in section ${section.name}`);
          }
        });
      });
    } else {
      console.log('No floating fixed theory subjects for semester:', semesterString);
    }

    // 4. STEP 3: Allot User-Input Theory Subjects - THIRD PRIORITY
    console.log('=== STEP 3: Allotting User Input Theory Subjects ===');
    console.log('User input theory subjects to allocate:', userInputTheorySubjects);
    
    if (userInputTheorySubjects.length === 0) {
      console.log('No user-input theory subjects to allocate');
    } else {
      filteredSections.forEach((section, idx) => {
        const grid = timetable[section.name];
        const sectionRoom = roomAssignment[section.name];
        
        console.log(`Processing user subjects for section ${section.name}:`, userInputTheorySubjects);
        
        userInputTheorySubjects.forEach(subject => {
          const remaining = subject.weeklyHours || 4;
          console.log(`Allocating ${subject.name} (${remaining} hours) for section ${section.name}`);
          
          const daysOrder = getRandomOrder([...Array(DAYS_TO_USE.length).keys()]);
          let usedDays: number[] = [];
          let placedCount = 0;
          
          for (let i = 0; i < remaining; i++) {
            let placed = false;
            
            for (const dayIdx of daysOrder) {
              if (usedDays.includes(dayIdx)) continue; // Only one per day
              
              // Check slots in order (morning first)
              for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
                if (slotIdx === LUNCH_INDEX || grid[dayIdx][slotIdx]) continue; // Skip if slot is already filled
                if (DAYS_TO_USE[dayIdx] === 'Sat' && slotIdx > 4) continue;
                
                // Handle faculty assignment
                const facultyId = subject.facultyPerSection?.[section.name];
                const facultyObj = faculty.find(f => f.id === facultyId);
                
                if (!facultyId || !facultyObj) {
                  const errorMsg = `No faculty assigned for ${subject.name} in section ${section.name}`;
                  conflictLog.push(`❌ ${errorMsg}`);
                  console.warn(errorMsg);
                  grid[dayIdx][slotIdx] = `${subject.name} (No Faculty) @${sectionRoom}`;
                } else {
                  let assignedFaculty = facultyObj;
                  let assignedFacultyId = facultyId;
                  let isAvailable = isFacultyGloballyAvailable(assignedFacultyId, DAYS_TO_USE[dayIdx], TIME_SLOTS[slotIdx]);
                  
                  // If preferred faculty is not available, try to find another free faculty
                  if (!isAvailable) {
                    const freeFaculty = faculty.find(f => 
                      isFacultyGloballyAvailable(f.id, DAYS_TO_USE[dayIdx], TIME_SLOTS[slotIdx])
                    );
                    if (freeFaculty) {
                      assignedFaculty = freeFaculty;
                      assignedFacultyId = freeFaculty.id;
                      isAvailable = true;
                      console.log(`🔄 Reassigned ${subject.name} to ${assignedFaculty.name} (original faculty busy)`);
                    }
                  }
                  
                  if (isAvailable) {
                    grid[dayIdx][slotIdx] = `${subject.name} (${assignedFaculty.name}) @${sectionRoom}`;
                    assignFacultyGlobally(assignedFacultyId, DAYS_TO_USE[dayIdx], TIME_SLOTS[slotIdx]);
                    console.log(`✓ Placed ${subject.name} with ${assignedFaculty.name} at ${DAYS_TO_USE[dayIdx]} ${TIME_SLOTS[slotIdx]}`);
                  } else {
                    grid[dayIdx][slotIdx] = `${subject.name} (Unassigned) @${sectionRoom}`;
                    console.log(`⚠️ Placed ${subject.name} (unassigned) at ${DAYS_TO_USE[dayIdx]} ${TIME_SLOTS[slotIdx]}`);
                  }
                }
                
                usedDays.push(dayIdx);
                placed = true;
                placedCount++;
                break;
              }
              if (placed) break;
            }
            
            if (!placed) {
              const errorMsg = `Could not place ${subject.name} in section ${section.name} - slot ${i + 1}`;
              conflictLog.push(`❌ ${errorMsg}`);
              console.warn(errorMsg);
            }
          }
          
          if (placedCount < remaining) {
            console.warn(`⚠️ Only placed ${placedCount}/${remaining} slots for subject ${subject.name} in section ${section.name}`);
          } else {
            console.log(`✓ Successfully placed all ${placedCount} slots for ${subject.name} in section ${section.name}`);
          }
        });
      });
    }

    // FINAL PROCESSING: Update state and handle conflicts
    console.log('=== FINAL PROCESSING ===');
    
    // Process any existing conflicts
    if (Object.keys(conflicts).length > 0) {
      console.log('Processing existing conflicts:', conflicts);
      Object.entries(conflicts).forEach(([sectionName, sectionConflicts]) => {
        sectionConflicts.forEach(conflict => {
          const errorMsg = `Conflict: ${conflict} in section ${sectionName}`;
          conflictLog.push(`❌ ${errorMsg}`);
          console.warn(errorMsg);
        });
      });
    }
    
    // Log summary
    console.log('=== GENERATION SUMMARY ===');
    console.log(`Generated timetables for ${filteredSections.length} sections`);
    console.log(`Total conflicts: ${conflictLog.length}`);
    if (conflictLog.length > 0) {
      console.log('Conflicts found:', conflictLog);
    }
    
    // Update state
    setConflicts({});
    setTimetables(timetable);
    
    // Show success/warning messages
    if (conflictLog.length === 0) {
      setSuccessMessage('✅ Timetable generated successfully with no conflicts!');
    } else {
      setSuccessMessage(`⚠️ Timetable generated with ${conflictLog.length} conflicts. Check console for details.`);
    }
    setTimeout(() => setSuccessMessage(''), 5000);
    
    setWarningMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Generator</h1>
          <p className="text-gray-600">Generate timetables for different semesters with automatic conflict resolution</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1st Semester</option>
                <option value="3">3rd Semester</option>
                <option value="5">5th Semester</option>
                <option value="7">7th Semester</option>
              </select>
            </div>

            {/* Include Saturday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Saturday
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeSaturday}
                  onChange={(e) => setIncludeSaturday(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Include Saturday classes</span>
              </div>
            </div>

            {/* Free Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Day
              </label>
              <select
                value={freeDay}
                onChange={(e) => setFreeDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Free Day</option>
                <option value="Mon">Monday</option>
                <option value="Tue">Tuesday</option>
                <option value="Wed">Wednesday</option>
                <option value="Thu">Thursday</option>
                <option value="Fri">Friday</option>
                <option value="Sat">Saturday</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={generate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Generate Timetable
              </button>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}
          {warningMessage && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">{warningMessage}</p>
            </div>
          )}
        </div>

        {/* Generated Timetables */}
        {Object.keys(timetables).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Timetables</h2>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  localStorage.setItem('savedTimetables', JSON.stringify(timetables));
                  navigate('/timetables');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Save & View
              </button>
              <button
                onClick={() => {
                  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
                  Object.entries(timetables).forEach(([sectionName, timetable], index) => {
                    if (index > 0) doc.addPage();
                    doc.setFontSize(18);
                    doc.text(`Section ${sectionName} Timetable`, 40, 40);
                    doc.setFontSize(10);
                    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

                    // Prepare table data: first column is Day, then all time slots as columns
                    const tableHead = [ ['Day', ...TIME_SLOTS] ];
                    const tableBody = DAYS_TO_USE.map((day, dayIndex) => {
                      const row = [day];
                      TIME_SLOTS.forEach((timeSlot, timeIndex) => {
                        let cellValue = timetable[dayIndex]?.[timeIndex] || '-';
                        row.push(cellValue);
                      });
                      return row;
                    });

                    (doc as any).autoTable({
                      startY: 80,
                      head: tableHead,
                      body: tableBody,
                      theme: 'grid',
                      styles: { fontSize: 9, cellPadding: 4 },
                      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
                      bodyStyles: {},
                      columnStyles: {
                        0: { cellWidth: 60 },
                        // Let autoTable size the rest
                      },
                      didDrawCell: function (data: any) {
                        // Optional: color code cells in PDF (yellow for labs, blue for fixed theory, etc.)
                        const value = data.cell.raw;
                        if (typeof value === 'string') {
                          if (value.includes('(Fixed Lab)') || value.includes('(Lab Block)')) {
                            doc.setFillColor(255, 249, 196); // light yellow
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                          } else if (value.includes('(Fixed Theory)') || value.includes('(Floating Fixed)')) {
                            doc.setFillColor(219, 234, 254); // light blue
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                          } else if (value.includes('(Unassigned)') || value.includes('(No Faculty)')) {
                            doc.setFillColor(254, 243, 199); // light orange
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                          } else if (value === 'Lunch Break') {
                            doc.setFillColor(229, 231, 235); // gray
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                          }
                        }
                      },
                    });
                  });
                  doc.save(`timetables_${semesterMap[semester]}_semester.pdf`);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Export PDF
              </button>
            </div>

            {/* Timetable Display */}
            <div className="space-y-6">
              {Object.entries(timetables).map(([sectionName, timetable]) => (
                <div key={sectionName} className="border rounded-lg overflow-hidden mb-8">
                  <div className="bg-white px-4 py-3 border-b">
                    <h3 className="text-2xl font-semibold text-blue-700">Section {sectionName}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-blue-700">
                          <th className="px-4 py-2 text-left font-bold text-white border border-gray-300">Day</th>
                          {TIME_SLOTS.map(timeSlot => (
                            <th key={timeSlot} className="px-4 py-2 text-left font-bold text-white border border-gray-300">{timeSlot}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS_TO_USE.map((day, dayIndex) => (
                          <tr key={day} className={dayIndex % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                            <td className="px-4 py-2 font-bold text-blue-700 border border-gray-300">{day}</td>
                            {TIME_SLOTS.map((timeSlot, timeIndex) => {
                              const cellValue = timetable[dayIndex]?.[timeIndex] || '-';
                              const isLab = cellValue.includes('(Fixed Lab)') || cellValue.includes('(Lab Block)');
                              const isFixedTheory = cellValue.includes('(Fixed Theory)') || cellValue.includes('(Floating Fixed)');
                              const isUnassigned = cellValue.includes('(Unassigned)') || cellValue.includes('(No Faculty)');
                              const isLunch = cellValue === 'Lunch Break';
                              let cellClass = 'px-4 py-2 text-sm border border-gray-300';
                              if (isLab) {
                                cellClass += ' bg-yellow-100';
                              } else if (isFixedTheory) {
                                cellClass += ' bg-blue-50';
                              } else if (isUnassigned) {
                                cellClass += ' bg-yellow-50 text-yellow-800';
                              } else if (isLunch) {
                                cellClass += ' bg-blue-50 text-gray-600';
                              }
                              return (
                                <td key={timeSlot} className={cellClass}>
                                  {isLunch ? <span className="italic">Lunch Break</span> : cellValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Timetables Message */}
        {Object.keys(timetables).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetables Generated</h3>
            <p className="text-gray-600 mb-4">
              Select a semester and click "Generate Timetable" to create timetables for all sections.
            </p>
            <div className="text-sm text-gray-500">
              <p>Make sure you have:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Added sections for the selected semester</li>
                <li>Added rooms for the timetable</li>
                <li>Added subjects and faculty assignments (optional)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableGenerator;
