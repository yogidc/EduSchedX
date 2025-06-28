import React from 'react';
import { cn } from '../../utils/cn';
import { Timetable, TimeSlot } from '../../types/timetable';

interface TimetableGridProps {
  data: Timetable;
  view: 'section' | 'faculty';
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ data, view }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = data.timeSlots;

  const getCellType = (day: string, timeSlot: TimeSlot): 'lecture' | 'lab' | 'elective' | 'placement' | 'break' | 'empty' => {
    // Check for lunch break
    if (timeSlot.startTime === '13:30') return 'break';
    
    // 4th semester placement hours
    if (data.semester === 4 && (day === 'Monday' || day === 'Friday') && timeSlot.startTime === '09:30') {
      return 'placement';
    }
    
    // 6th semester electives
    if (data.semester === 6) {
      if ((day === 'Tuesday' || day === 'Friday') && timeSlot.startTime === '14:30') {
        return 'elective';
      }
      // Free Saturday for 6th semester
      if (day === 'Saturday') return 'empty';
    }
    
    // 3rd semester MH Lab
    if (data.semester === 3 && day === 'Tuesday' && timeSlot.startTime === '14:30') {
      return 'lab';
    }
    
    // Lab sessions (typically longer duration)
    if (day === 'Wednesday' && timeSlot.startTime === '09:30') return 'lab';
    
    // Regular lectures
    const rand = Math.random();
    if (rand < 0.7) return 'lecture';
    if (rand < 0.8) return 'lab';
    return 'empty';
  };

  const getCellContent = (day: string, timeSlot: TimeSlot) => {
    const type = getCellType(day, timeSlot);
    
    if (type === 'empty') return null;
    if (type === 'break') return 'Lunch Break';
    
    // Semester-specific content
    if (type === 'placement') return 'Placement Training';
    
    if (data.semester === 3 && type === 'lab') {
      return 'MH Lab (Batch 1)';
    }
    
    if (data.semester === 6 && type === 'elective') {
      if (day === 'Tuesday' || day === 'Friday') {
        return 'Open Elective';
      }
      return 'Professional Elective';
    }
    
    if (type === 'lecture') {
      const lectures = [
        'Data Structures (Dr. Smith)',
        'Database Systems (Dr. Johnson)',
        'Computer Networks (Dr. Williams)',
        'Operating Systems (Dr. Brown)',
        'Software Engineering (Dr. Davis)',
        'Web Technologies (Dr. Wilson)'
      ];
      return lectures[Math.floor(Math.random() * lectures.length)];
    }
    
    if (type === 'lab') {
      const labs = [
        'Data Structures Lab (Dr. Smith)',
        'Database Lab (Dr. Johnson)',
        'Network Lab (Dr. Williams)',
        'OS Lab (Dr. Brown)'
      ];
      return labs[Math.floor(Math.random() * labs.length)];
    }
    
    return null;
  };

  const getRoomInfo = (day: string, timeSlot: TimeSlot) => {
    const type = getCellType(day, timeSlot);
    
    if (type === 'empty' || type === 'break') return null;
    
    if (type === 'lab') {
      const labRooms = data.rooms.filter(r => r.type === 'lab');
      return labRooms[0]?.name || 'Lab A1';
    }
    
    const classrooms = data.rooms.filter(r => r.type === 'classroom');
    return classrooms[0]?.name || 'Room 101';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="py-3 px-4 border border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Time / Day
            </th>
            {days.map((day) => {
              // Skip Saturday for 6th semester if it should be free
              if (data.semester === 6 && day === 'Saturday') {
                return (
                  <th key={day} className="py-3 px-4 border border-gray-200 dark:border-gray-600 text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {day} (Free)
                  </th>
                );
              }
              return (
                <th key={day} className="py-3 px-4 border border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {day}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {timeSlots.map((timeSlot) => (
            <tr key={timeSlot.id}>
              <td className="py-3 px-4 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 font-medium">
                {timeSlot.startTime} - {timeSlot.endTime}
              </td>
              {days.map((day) => {
                const cellType = getCellType(day, timeSlot);
                const content = getCellContent(day, timeSlot);
                const roomInfo = getRoomInfo(day, timeSlot);
                
                // Special handling for 6th semester Saturday
                if (data.semester === 6 && day === 'Saturday') {
                  return (
                    <td 
                      key={`${day}-${timeSlot.id}`} 
                      className="py-3 px-4 border border-gray-200 dark:border-gray-600 text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-center italic"
                    >
                      Free Day
                    </td>
                  );
                }
                
                return (
                  <td 
                    key={`${day}-${timeSlot.id}`} 
                    className={cn(
                      "py-3 px-4 border border-gray-200 dark:border-gray-600 text-sm",
                      {
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200': cellType === 'lecture',
                        'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200': cellType === 'lab',
                        'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200': cellType === 'elective',
                        'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200': cellType === 'placement',
                        'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 italic': cellType === 'break',
                      }
                    )}
                  >
                    <div>
                      {content}
                      {roomInfo && (
                        <div className="text-xs opacity-75 mt-1">
                          📍 {roomInfo}
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;