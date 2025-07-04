import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Printer, Edit, ChevronLeft, ChevronRight, AlertTriangle, Trash2, Eye, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import TimetableLegend from '../components/timetable/TimetableLegend';
import { exportToCSV, exportTimetableToPDFWithAutoTable } from '../utils/exportUtils';
import { Timetable, TimetableCell, TimetableDay } from '../types/timetable';

const TimetableView: React.FC = () => {
  const { timetables, rooms, sections, setTimetables } = useApp();
  const { semesterId, sectionId } = useParams<{ semesterId: string; sectionId: string }>();
  
  // Load timetables from localStorage if context is empty
  useEffect(() => {
    if (Object.keys(timetables).length === 0) {
      const saved = localStorage.getItem('savedTimetables');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimetables(parsed);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [timetables, setTimetables]);
  
  // Gather all available timetables
  const allTimetables: { semester: string; section: string }[] = [];
  Object.entries(timetables).forEach(([sem, sections]) => {
    Object.keys(sections).forEach(section => {
      allTimetables.push({ semester: sem, section });
    });
  });
  
  // State for selected timetable
  const [selected, setSelected] = useState<{ semester: string; section: string } | null>(
    semesterId && sectionId
      ? { semester: semesterId, section: sectionId }
      : allTimetables.length > 0
        ? allTimetables[0]
        : null
  );
  const [selectedView, setSelectedView] = useState<'section'>('section');
  const [showConflicts, setShowConflicts] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ semester: string; section: string } | null>(null);
  const [showAllTimetables, setShowAllTimetables] = useState(true);
  
  // Build a Timetable object for the selected timetable
  let timetableObj: Timetable | null = null;
  if (selected && timetables[selected.semester] && timetables[selected.semester][selected.section]) {
    // Map the days object to correct TimetableCell types and always set subjectId to the visible label
    const rawDays = timetables[selected.semester][selected.section];
    const days: { [day: string]: { [slot: string]: TimetableCell } } = {};
    Object.entries(rawDays).forEach(([day, slots]) => {
      days[day] = {};
      Object.entries(slots).forEach(([slot, cell]) => {
        let mappedType: TimetableCell['type'] = undefined;
        let subjectId: string = '';
        if (typeof cell === 'string' && cell) {
          const cellStr = String(cell);
          const lower = cellStr.toLowerCase();
          if (lower.includes('(fixed lab)')) {
            mappedType = 'Lab';
            subjectId = cellStr.split('(Fixed Lab)')[0].trim();
          } else if (lower.includes('(fixed theory)')) {
            mappedType = 'Lecture';
            subjectId = cellStr.split('(Fixed Theory)')[0].trim();
          } else {
            subjectId = cellStr;
            if (lower.includes('lab')) mappedType = 'Lab';
            else if (lower.includes('theory')) mappedType = 'Lecture';
            else if (lower.includes('placement')) mappedType = 'Placement';
            else if (lower.includes('break')) mappedType = 'Break';
            else if (lower.includes('elective')) mappedType = 'Elective';
          }
        } else if (cell && typeof cell === 'object') {
          subjectId = (cell as any).subjectId || (cell as any).subject || '';
          let typeString = '';
          if (cell.type) typeString = String(cell.type).toLowerCase();
          if (typeString === 'theory') mappedType = 'Lecture';
          else if (typeString === 'lab') mappedType = 'Lab';
          else if (typeString === 'placement') mappedType = 'Placement';
          else if (typeString === 'break') mappedType = 'Break';
          else if (typeString === 'elective') mappedType = 'Elective';
          else if ([
            'lecture', 'lab', 'elective', 'placement', 'break'
          ].includes(typeString)) {
            // Only assign if typeString matches allowed types
            const allowedTypes = ['Lecture', 'Lab', 'Elective', 'Placement', 'Break'];
            const capitalized = typeString.charAt(0).toUpperCase() + typeString.slice(1);
            if (allowedTypes.includes(capitalized)) {
              mappedType = capitalized as TimetableCell['type'];
            } else {
              mappedType = undefined;
            }
          } else {
            mappedType = undefined;
          }
        }
        days[day][slot] = { ...cell, subjectId, type: mappedType };
      });
    });
    timetableObj = {
      id: `${selected.semester}-${selected.section}`,
      semester: parseInt(selected.semester, 10),
      section: selected.section,
      days,
      timeSlots: [],
      rooms: [],
      conflicts: []
    };
  }
  
  const handleExportPDF = () => {
    if (selected && timetables[selected.semester] && timetables[selected.semester][selected.section]) {
      const rawGrid = timetables[selected.semester][selected.section];
      // Map rawGrid to correct TimetableDay/TimetableCell types for export
      const mappedDays: { [day: string]: { [slot: string]: any } } = {};
      Object.entries(rawGrid).forEach(([day, slots]) => {
        mappedDays[day] = {};
        Object.entries(slots).forEach(([slot, cell]) => {
          if (typeof cell === 'object' && cell !== null && cell.type) {
            let mappedType = cell.type;
            if (mappedType === 'theory') mappedType = 'Lecture' as any;
            else if (mappedType === 'lab') mappedType = 'Lab' as any;
            else if (mappedType === 'placement') mappedType = 'Placement' as any;
            mappedDays[day][slot] = { ...cell, type: mappedType };
          } else {
            mappedDays[day][slot] = cell;
          }
        });
      });
      exportTimetableToPDFWithAutoTable({
        id: `${selected.semester}-${selected.section}`,
        semester: parseInt(selected.semester, 10),
        section: selected.section,
        days: mappedDays,
        timeSlots: [],
        rooms: [],
        conflicts: []
      }, `Timetable_Sem${selected?.semester}_Section${selected?.section}`);
    }
  };
  
  const handleExportCSV = () => {
    if (timetableObj) exportToCSV(timetableObj, `Timetable_Sem${selected?.semester}_Section${selected?.section}`);
  };

  const handleResolveConflict = (conflictId: string) => {
    console.log('Resolving conflict:', conflictId);
  };

  const handleDismissConflict = (conflictId: string) => {
    console.log('Dismissing conflict:', conflictId);
  };

  const handleDeleteTimetable = (semester: string, section: string) => {
    const newTimetables = { ...timetables };
    if (newTimetables[semester] && newTimetables[semester][section]) {
      delete newTimetables[semester][section];
      // If no more sections in this semester, remove the semester
      if (Object.keys(newTimetables[semester]).length === 0) {
        delete newTimetables[semester];
      }
    }
    setTimetables(newTimetables);
    setDeleteConfirm(null);
    
    // If we deleted the currently selected timetable, select the first available one
    if (selected && selected.semester === semester && selected.section === section) {
      const remainingTimetables = Object.entries(newTimetables).flatMap(([sem, sections]) =>
        Object.keys(sections).map(section => ({ semester: sem, section }))
      ).filter(t => !(t.semester === semester && t.section === section));
      
      if (remainingTimetables.length > 0) {
        setSelected(remainingTimetables[0]);
      } else {
        setSelected(null);
      }
    }
  };

  const getTimetableStatus = (semester: string, section: string) => {
    const grid = timetables[semester]?.[section];
    if (!grid) return { status: 'error', text: 'Not Found' };
    
    const conflicts = Array.isArray(grid.conflicts) ? grid.conflicts : [];
    if (conflicts.length > 0) {
      return { status: 'warning', text: `${conflicts.length} Conflicts` };
    }
    
    return { status: 'success', text: 'Ready' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timetable Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all generated timetables</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/generator" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Calendar size={16} className="mr-2" />
            Generate New
          </Link>
        </div>
      </div>

      {/* All Timetables Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Generated Timetables</h2>
            <button
              onClick={() => setShowAllTimetables(!showAllTimetables)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showAllTimetables ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {showAllTimetables && (
          <div className="p-6">
            {allTimetables.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No timetables generated yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Generate your first timetable to get started</p>
                <Link 
                  to="/generator" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Generate Timetable
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTimetables.map(({ semester, section }) => {
                  const status = getTimetableStatus(semester, section);
                  const isSelected = selected && selected.semester === semester && selected.section === section;
                  
                  return (
                    <div 
                      key={`${semester}-${section}`}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {semester}th Semester - Section {section}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            status.status === 'success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              : status.status === 'warning'
                              ? 'bg-white text-black'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          }`}>
                            {status.text}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected({ semester, section });
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            title="View Timetable"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ semester, section });
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            title="Delete Timetable"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected({ semester, section });
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const grid = timetables[semester]?.[section];
                            if (grid) {
                              const timetableForExport: Timetable = {
                                id: `${semester}-${section}`,
                                semester: parseInt(semester),
                                section,
                                days: {},
                                timeSlots: [],
                                rooms: [],
                                conflicts: []
                              };
                              exportTimetableToPDFWithAutoTable(timetableForExport, `Timetable_Sem${semester}_Section${section}`);
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Timetable View */}
      {selected && timetableObj && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selected.semester}th Semester - Section {selected.section} Timetable
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed view of the selected timetable</p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                {timetableObj.conflicts && timetableObj.conflicts.length > 0 && (
                  <button
                    onClick={() => setShowConflicts(!showConflicts)}
                    className="inline-flex items-center px-3 py-1.5 border border-amber-300 dark:border-amber-600 text-sm font-medium rounded-md shadow-sm text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    <AlertTriangle size={16} className="mr-1" />
                    {timetableObj.conflicts.length} Conflicts
                  </button>
                )}
                
                <button
                  onClick={() => {window.print()}}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Printer size={16} className="mr-1" />
                  Print
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download size={16} className="mr-1" />
                  CSV
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download size={16} className="mr-1" />
                  PDF
                </button>
                
                <Link 
                  to="/generator" 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Conflicts Section */}
            {showConflicts && timetableObj && timetableObj.conflicts && Array.isArray(timetableObj.conflicts) && timetableObj.conflicts.length > 0 && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-300">Conflicts</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {timetableObj.conflicts.map((conflict, idx) => (
                    <li key={conflict.id || idx} className="text-red-700 dark:text-red-300">
                      <div className="font-semibold">{conflict.description}</div>
                      {conflict.affectedSlots && conflict.affectedSlots.length > 0 && (
                        <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                          Affected Slots: {conflict.affectedSlots.map(slot => `${slot.day} @ ${slot.timeSlot} (Sections: ${slot.sections.join(', ')})`).join('; ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              {timetableObj && <TimetableGrid data={timetableObj} view={selectedView} />}
            </div>
            
            {/* Legend */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <TimetableLegend />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Timetable
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the timetable for {deleteConfirm.semester}th Semester - Section {deleteConfirm.section}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTimetable(deleteConfirm.semester, deleteConfirm.section)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;