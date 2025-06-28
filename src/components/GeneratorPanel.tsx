import React, { useState } from 'react';
import { Play, Download, Calendar, AlertCircle, CheckCircle, Settings, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimetableGenerator } from '../utils/timetableGenerator';

// Define these locally
const semesters = ['1st', '3rd', '5th', '7th'];
const freeDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'none'];

const GeneratorPanel: React.FC = () => {
  const { faculty, subjects, sections, rooms, setTimetables, setConflicts } = useApp();
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>(['3rd']);
  const [enableSaturday, setEnableSaturday] = useState(false);
  const [enablePlacement, setEnablePlacement] = useState(false);
  const [noFreeDayClasses, setNoFreeDayClasses] = useState(true);
  const [freeDays, setFreeDays] = useState<Record<string, string>>({
    '1st': 'Friday',
    '3rd': 'Friday', 
    '5th': 'Friday',
    '7th': 'Friday'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generationMessage, setGenerationMessage] = useState('');

  const validateData = () => {
    const errors: string[] = [];
    
    if (faculty.length === 0) errors.push('No faculty members added');
    if (subjects.length === 0) errors.push('No subjects added');
    if (sections.length === 0) errors.push('No sections added');
    if (rooms.length === 0) errors.push('No rooms added');
    
    // Check faculty-subject assignment constraint
    selectedSemesters.forEach(semester => {
      const semesterSubjects = subjects.filter(s => s.semester === semester && s.type === 'theory');
      const facultyAssignments: Record<string, number> = {};
      
      semesterSubjects.forEach(subject => {
        facultyAssignments[subject.faculty] = (facultyAssignments[subject.faculty] || 0) + 1;
      });
      
      Object.entries(facultyAssignments).forEach(([facultyId, count]) => {
        if (count > 1) {
          const facultyMember = faculty.find(f => f.id === facultyId);
          errors.push(`Faculty "${facultyMember?.name}" is assigned to multiple theory subjects in ${semester} semester`);
        }
      });
    });
    
    return errors;
  };

  const handleGenerate = async () => {
    const validationErrors = validateData();
    if (validationErrors.length > 0) {
      setGenerationStatus('error');
      setGenerationMessage(validationErrors.join('; '));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('idle');
    setGenerationMessage('Generating timetables...');
    
    try {
      const generator = new TimetableGenerator(faculty, subjects, sections, rooms);
      const result = generator.generate({
        semesters: selectedSemesters,
        enableSaturday,
        enablePlacement,
        noFreeDayClasses,
        freeDays
      });
      
      setTimetables(result.timetable);
      setConflicts(result.conflicts);
      
      if (result.conflicts.length === 0) {
        setGenerationStatus('success');
        setGenerationMessage(`Timetables generated successfully for ${selectedSemesters.join(', ')} semesters!`);
      } else {
        setGenerationStatus('error');
        setGenerationMessage(`Generated with ${result.conflicts.length} conflicts. Check the Conflicts tab for details.`);
      }
    } catch (error) {
      setGenerationStatus('error');
      setGenerationMessage('Error generating timetables. Please check your data and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSemesterToggle = (semester: string) => {
    setSelectedSemesters(prev => 
      prev.includes(semester) 
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  const clearGenerationStatus = () => {
    setGenerationStatus('idle');
    setGenerationMessage('');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Timetable Generator</h2>
        <p className="text-slate-600">Configure and generate smart timetables with constraint solving</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Semester Selection */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Select Semesters
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {semesters.map(semester => (
                <label key={semester} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSemesters.includes(semester)}
                    onChange={() => handleSemesterToggle(semester)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">{semester} Semester</span>
                </label>
              ))}
            </div>
          </div>

          {/* Free Days Configuration */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-emerald-600" />
              Free Days per Semester
            </h3>
            
            {/* No Free Day Classes Option */}
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noFreeDayClasses}
                  onChange={(e) => setNoFreeDayClasses(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="text-emerald-800 font-medium">Strict Free Day Policy</span>
                  <p className="text-sm text-emerald-700">No classes scheduled on designated free days</p>
                </div>
              </label>
            </div>
            
            <div className="space-y-3">
              {selectedSemesters.map(semester => (
                <div key={semester} className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">{semester} Semester:</label>
                  <select
                    value={freeDays[semester]}
                    onChange={(e) => setFreeDays(prev => ({ ...prev, [semester]: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {freeDayOptions.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Options</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSaturday}
                  onChange={(e) => setEnableSaturday(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-slate-700 font-medium">Enable Saturday Classes</span>
                  <p className="text-sm text-slate-500">Classes only till 1:30 PM on Saturday</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePlacement}
                  onChange={(e) => setEnablePlacement(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-slate-700 font-medium">Enable Placement Classes</span>
                  <p className="text-sm text-slate-500">4 hours/week in 2-hour continuous blocks</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Generation Panel */}
        <div className="space-y-6">
          {/* Data Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{faculty.length}</div>
                <div className="text-sm text-slate-600">Faculty Members</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600">{subjects.length}</div>
                <div className="text-sm text-slate-600">Subjects</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
                <div className="text-sm text-slate-600">Sections</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600">{rooms.length}</div>
                <div className="text-sm text-slate-600">Rooms</div>
              </div>
            </div>
          </div>

          {/* Generation Status */}
          {generationMessage && (
            <div className={`rounded-xl p-4 border relative ${
              generationStatus === 'success' 
                ? 'bg-emerald-50 border-emerald-200' 
                : generationStatus === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <button
                onClick={clearGenerationStatus}
                className="absolute top-2 right-2 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-2 pr-8">
                {generationStatus === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                {generationStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                {generationStatus === 'idle' && <Calendar className="w-5 h-5 text-blue-600" />}
                <span className={`font-medium ${
                  generationStatus === 'success' ? 'text-emerald-800' :
                  generationStatus === 'error' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {generationMessage}
                </span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSemesters.length === 0}
            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
              isGenerating || selectedSemesters.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Generate Timetables</span>
              </>
            )}
          </button>

          {/* Constraints Info */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Applied Constraints</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Fixed lab slots are pre-assigned</li>
              <li>• One faculty per theory subject per semester</li>
              <li>• No faculty/room double booking</li>
              <li>• Lunch break: 1:30-2:30 PM</li>
              <li>• Faculty max hours per day limit</li>
              <li>• No back-to-back classes for faculty</li>
              <li>• Weekly free day per semester {noFreeDayClasses && '(strict policy)'}</li>
              <li>• Saturday classes only till 1:30 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPanel;