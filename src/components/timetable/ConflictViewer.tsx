// src/pages/ConflictViewer.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = ['9:30–10:30', '10:30–11:30', '11:30–12:30', '12:30–1:30', '2:30–3:30', '3:30–4:30'];

interface AffectedSlot {
  day: string;
  timeSlot: string;
  sections: string[];
}

interface Conflict {
  id: string;
  type: 'faculty' | 'lab';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedSlots: AffectedSlot[];
}

interface ConflictViewerProps {
  onResolve?: (conflictId: string) => void;
  onDismiss?: (conflictId: string) => void;
}

const ConflictViewer: React.FC<ConflictViewerProps> = ({ onResolve, onDismiss }) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  useEffect(() => {
    const timetableData = JSON.parse(localStorage.getItem('timetables') || '{}');
    const labData = JSON.parse(localStorage.getItem('labAssignments') || '{}');

    const facultySlotMap: Record<string, { section: string }> = {};
    const generatedConflicts: Conflict[] = [];

    // Check timetable-based faculty overlaps
    for (const [section, week] of Object.entries(timetableData)) {
      (week as string[][]).forEach((dayRow, dayIdx) => {
        dayRow.forEach((cell, timeIdx) => {
          const match = cell?.match(/\((.*?)\)/);
          if (match) {
            const faculty = match[1];
            const key = `${faculty}-${dayIdx}-${timeIdx}`;

            if (facultySlotMap[key]) {
              generatedConflicts.push({
                id: `conflict-${faculty}-${dayIdx}-${timeIdx}`,
                type: 'faculty',
                severity: 'high',
                description: `Faculty ${faculty} has overlapping classes for "${facultySlotMap[key].section}" and "${section}" on ${DAYS[dayIdx]} ${SLOTS[timeIdx]}`,
                affectedSlots: [
                  { day: DAYS[dayIdx], timeSlot: SLOTS[timeIdx], sections: [facultySlotMap[key].section, section] }
                ]
              });
            } else {
              facultySlotMap[key] = { section };
            }
          }
        });
      });
    }

    // Check lab-based conflicts
    Object.values(labData).forEach((batchList: any) => {
      batchList.forEach((entry: any) => {
        const { faculty, day, time, lab, batch } = entry;
        const dayIdx = DAYS.indexOf(day);
        const timeIdx = SLOTS.indexOf(time);
        const key = `${faculty}-${dayIdx}-${timeIdx}`;

        if (facultySlotMap[key]) {
          generatedConflicts.push({
            id: `lab-${faculty}-${day}-${time}`,
            type: 'lab',
            severity: 'medium',
            description: `Lab clash for ${faculty} at ${day} ${time} in "${lab}" for batch ${batch}.`,
            affectedSlots: [
              { day, timeSlot: time, sections: [batch] }
            ]
          });
        } else {
          facultySlotMap[key] = { section: lab };
        }
      });
    });

    setConflicts(generatedConflicts);
  }, []);

  const getSeverityIcon = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getTextColor = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-800 dark:text-red-200';
      case 'medium':
        return 'text-amber-800 dark:text-amber-200';
      case 'low':
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-red-600">🧪 Conflict Viewer</h1>

      {conflicts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200">
          <Info className="inline mr-2" /> No conflicts detected across timetable and lab assignments!
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(conflict.severity)}
                  <div>
                    <h4 className={`font-semibold ${getTextColor(conflict.severity)}`}>
                      {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
                    </h4>
                    <p className={`text-sm mt-1 ${getTextColor(conflict.severity)}`}>
                      {conflict.description}
                    </p>

                    {/* Affected Slots */}
                    <div className="mt-2 space-y-1 text-xs">
                      <p className={`font-medium ${getTextColor(conflict.severity)}`}>
                        Affected Slots:
                      </p>
                      {conflict.affectedSlots.map((slot, idx) => (
                        <div key={idx} className={`${getTextColor(conflict.severity)}`}>
                          <span className="font-semibold">{slot.day}</span> @{' '}
                          <span className="font-semibold">{slot.timeSlot}</span>
                          {slot.sections.length > 0 && (
                            <> – Sections: {slot.sections.join(', ')}</>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex space-x-2">
                  {onResolve && (
                    <button
                      onClick={() => onResolve(conflict.id)}
                      className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Auto-Resolve
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(conflict.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictViewer;
