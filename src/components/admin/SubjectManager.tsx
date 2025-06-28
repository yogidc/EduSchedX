import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Define semesters locally
const semesters = ['1st', '3rd', '5th', '7th'];

const SubjectManager: React.FC = () => {
  const { subjects, faculty, sections, addSubject, updateSubject, deleteSubject, rooms } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState('1st');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    weeklyHours: 3,
    type: 'theory' as 'theory' | 'lab',
    semester: selectedSemester,
    facultyPerSection: {} as { [section: string]: string },
    roomPerSection: {} as { [section: string]: string }
  });

  // Update formData semester when selectedSemester changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, semester: selectedSemester }));
  }, [selectedSemester]);

  // Get sections for the selected semester
  const semesterSections = sections.filter(s => s.semester === selectedSemester);

  // Filter subjects by selected semester
  const filteredSubjects = subjects.filter(s => s.semester === selectedSemester);

  // Get available faculty for a semester and section (excluding those already assigned to theory subjects in that section)
  const getAvailableFaculty = (semester: string, sectionName: string, excludeSubjectId?: string) => {
    const assignedFacultyIds = subjects
      .filter(s => s.semester === semester && s.type === 'theory' && s.id !== excludeSubjectId)
      .map(s => s.facultyPerSection?.[sectionName])
      .filter(Boolean);
    return faculty.filter(f => !assignedFacultyIds.includes(f.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate faculty assignment for theory subjects
    if (formData.type === 'theory') {
      for (const section of semesterSections) {
        const availableFaculty = getAvailableFaculty(selectedSemester, section.name, editingSubject?.id);
        const selectedFaculty = faculty.find(f => f.id === formData.facultyPerSection[section.name]);
        if (!selectedFaculty || !availableFaculty.includes(selectedFaculty)) {
          alert(`Faculty for section ${section.name} is already assigned to another theory subject in this semester. Please choose a different faculty member.`);
          return;
        }
        // Room selection validation (optional: ensure a room is selected)
        if (!formData.roomPerSection[section.name]) {
          alert(`Please select a room for section ${section.name}.`);
          return;
        }
      }
    }
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        ...editingSubject,
        ...formData
      });
    } else {
      addSubject({
        id: Date.now().toString(),
        ...formData
      });
    }
    setFormData({ name: '', code: '', weeklyHours: 3, type: 'theory', semester: selectedSemester, facultyPerSection: {}, roomPerSection: {} });
    setEditingSubject(null);
    setIsModalOpen(false);
  };

  const handleEdit = (subject: any) => {
    setEditingSubject(subject);
    // Backward compatibility: if subject has only a single faculty, convert to facultyPerSection for all sections
    let facultyPerSection = subject.facultyPerSection || {};
    let roomPerSection = subject.roomPerSection || {};
    if (!facultyPerSection || Object.keys(facultyPerSection).length === 0) {
      const allSections = sections.filter(s => s.semester === subject.semester);
      facultyPerSection = {};
      for (const sec of allSections) {
        // Handle both old 'faculty' property and new 'facultyPerSection' property
        facultyPerSection[sec.name] = (subject as any).faculty || '';
      }
    }
    if (!roomPerSection || Object.keys(roomPerSection).length === 0) {
      const allSections = sections.filter(s => s.semester === subject.semester);
      roomPerSection = {};
      for (const sec of allSections) {
        // Handle both old 'room' property and new 'roomPerSection' property
        roomPerSection[sec.name] = (subject as any).room || '';
      }
    }
    setFormData({
      name: subject.name,
      code: subject.code,
      weeklyHours: subject.weeklyHours,
      type: subject.type,
      semester: subject.semester,
      facultyPerSection,
      roomPerSection
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteSubject(id);
    }
  };

  const getFacultyName = (facultyId: string) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : 'Unknown Faculty';
  };

  const checkFacultyConflicts = () => {
    const conflicts: string[] = [];
    
    semesters.forEach(semester => {
      const semesterTheorySubjects = subjects.filter(s => s.semester === semester && s.type === 'theory');
      const facultyAssignments: Record<string, string[]> = {};
      
      semesterTheorySubjects.forEach(subject => {
        // Handle both old and new faculty assignment formats
        const facultyId = (subject as any).faculty || Object.values(subject.facultyPerSection || {})[0] || '';
        if (!facultyAssignments[facultyId]) {
          facultyAssignments[facultyId] = [];
        }
        facultyAssignments[facultyId].push(subject.name);
      });
      
      Object.entries(facultyAssignments).forEach(([facultyId, subjectNames]) => {
        if (subjectNames.length > 1) {
          const facultyName = getFacultyName(facultyId);
          conflicts.push(`${facultyName} is assigned to multiple theory subjects in ${semester} semester: ${subjectNames.join(', ')}`);
        }
      });
    });
    
    return conflicts;
  };

  const facultyConflicts = checkFacultyConflicts();
  const availableFacultyForCurrentForm = getAvailableFaculty(selectedSemester, editingSubject?.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Subject Management</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Semester Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedSemester === sem
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sem} Semester
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Constraint Info */}
      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-emerald-800">
          <strong>Constraint:</strong> Each faculty member can teach only one theory subject per semester to ensure proper workload distribution and avoid conflicts.
        </p>
      </div>

      {/* Faculty Conflicts Warning */}
      {facultyConflicts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Faculty Assignment Conflicts Detected</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {facultyConflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Subject List */}
      <div className="grid gap-4">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  subject.type === 'theory' ? 'bg-emerald-100' : 'bg-orange-100'
                }`}>
                  <BookOpen className={`w-5 h-5 ${
                    subject.type === 'theory' ? 'text-emerald-600' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-slate-900">{subject.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      subject.type === 'theory' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {subject.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {subject.code} • {subject.weeklyHours}h/week • {subject.semester} Semester
                  </p>
                  {subject.type === 'theory' && subject.facultyPerSection && (
                    <div className="text-sm text-slate-500 mt-1">
                      {Object.entries(subject.facultyPerSection).map(([section, facId]) => {
                        const fac = faculty.find(f => f.id === facId);
                        const roomId = subject.roomPerSection ? subject.roomPerSection[section] : undefined;
                        const room = rooms.find(r => r.id === roomId);
                        return (
                          <div key={section}>
                            <span className="font-semibold">Section {section}:</span> {fac ? fac.name : 'Unknown Faculty'}
                            {room ? (
                              <span className="ml-2 text-orange-700">Room: {room.name}</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {subject.type === 'lab' && (
                    <p className="text-sm text-slate-500">Lab subject</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No subjects added yet</p>
            <p className="text-sm">Click "Add Subject" to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weekly Hours
                </label>
                <input
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={1}
                  max={10}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value, facultyPerSection: {}, roomPerSection: {} })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'theory' | 'lab' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              {/* Faculty selection per section for theory subjects */}
              {formData.type === 'theory' && semesterSections.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assign Faculty & Room (per Section)
                  </label>
                  <div className="space-y-2">
                    {semesterSections.map(section => (
                      <div key={section.id} className="flex items-center gap-2">
                        <span className="w-16 font-medium">{section.name}</span>
                        <select
                          value={formData.facultyPerSection[section.name] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            facultyPerSection: {
                              ...formData.facultyPerSection,
                              [section.name]: e.target.value
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        >
                          <option value="">Select Faculty</option>
                          {getAvailableFaculty(selectedSemester, section.name, editingSubject?.id).map(fac => (
                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                          ))}
                        </select>
                        <select
                          value={formData.roomPerSection[section.name] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            roomPerSection: {
                              ...formData.roomPerSection,
                              [section.name]: e.target.value
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          <option value="">Select Room</option>
                          {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSubject(null);
                    setFormData({ name: '', code: '', weeklyHours: 3, type: 'theory', semester: selectedSemester, facultyPerSection: {}, roomPerSection: {} });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {editingSubject ? 'Update' : 'Add'} Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;