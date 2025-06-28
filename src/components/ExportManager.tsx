import React, { useState } from 'react';
import { Download, FileText, Table, Calendar, Users, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Define semesters locally
const semesters = ['1st', '3rd', '5th', '7th'];

const ExportManager: React.FC = () => {
  const { timetables, rooms } = useApp();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedView, setSelectedView] = useState<'room'>('room');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const generateCSVData = () => {
    let csvData = '';
    csvData = 'Room,Day,Time,Subject,Faculty,Section,Type,Batch\n';
    rooms.forEach(room => {
      Object.entries(timetables).forEach(([semester, semesterData]) => {
        if (selectedSemester !== 'all' && selectedSemester !== semester) return;
        Object.entries(semesterData).forEach(([section, sectionData]) => {
          Object.entries(sectionData).forEach(([day, dayData]) => {
            Object.entries(dayData).forEach(([timeSlot, slotData]) => {
              if (slotData.room === room.name) {
                csvData += `${room.name},${day},${timeSlot},${slotData.subject},${slotData.faculty},${section},${slotData.type},${slotData.batch || ''}\n`;
              }
            });
          });
        });
      });
    });
    return csvData;
  };

  const downloadCSV = () => {
    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const semesterText = selectedSemester === 'all' ? 'All' : selectedSemester;
    link.download = `timetable-${selectedView}-${semesterText}-semester.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePrintableHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EduSchedX Timetable</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .semester-section { margin-bottom: 40px; page-break-after: always; }
          .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .theory { background-color: #dbeafe; }
          .lab { background-color: #d1fae5; }
          .placement { background-color: #fed7aa; }
          .lunch { background-color: #fef3c7; text-align: center; font-weight: bold; }
          .free { color: #94a3b8; text-align: center; }
          @media print {
            .no-print { display: none; }
            .semester-section { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EduSchedX - Smart Timetable Generator</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    html += `</body></html>`;
    return html;
  };

  const downloadPDF = () => {
    const htmlContent = generatePrintableHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleExport = () => {
    if (selectedFormat === 'csv') {
      downloadCSV();
    } else {
      downloadPDF();
    }
  };

  const availableSemesters = Object.keys(timetables);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Export Manager</h2>
        <p className="text-slate-600">Export timetables in multiple formats for different stakeholders</p>
      </div>

      {/* Export Configuration */}
      <div className="mb-8">
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Configuration</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="pdf"
                    checked={selectedFormat === 'pdf'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'pdf')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="text-slate-700">PDF (Printable)</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="csv"
                    checked={selectedFormat === 'csv'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'csv')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-700">CSV (Excel)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* View Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Timetable View
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="room"
                    checked={selectedView === 'room'}
                    onChange={(e) => setSelectedView(e.target.value as 'room')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-orange-600" />
                    <span className="text-slate-700">Room View</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Semester Filter
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Semesters</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem} Semester</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Export Statistics */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{availableSemesters.length}</div>
              <div className="text-sm text-slate-600">Semesters</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(timetables).reduce((total, sem) => total + Object.keys(sem).length, 0)}
              </div>
              <div className="text-sm text-slate-600">Sections</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{rooms.length}</div>
              <div className="text-sm text-slate-600">Rooms</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(timetables).reduce((total, sem) => 
                  total + Object.values(sem).reduce((semTotal, section) => 
                    semTotal + Object.values(section).reduce((dayTotal, day) => 
                      dayTotal + Object.keys(day).length, 0), 0), 0)}
              </div>
              <div className="text-sm text-slate-600">Total Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Export</h3>
              <p className="text-slate-600">
                Export {selectedView} timetables in {selectedFormat.toUpperCase()} format
                {selectedSemester !== 'all' ? ` for ${selectedSemester} semester` : ' for all semesters'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={availableSemesters.length === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                availableSemesters.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Export {selectedFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Format Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h4 className="font-semibold text-red-900">PDF Export</h4>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Printable format with professional layout</li>
            <li>• Color-coded class types (Theory, Lab, Placement)</li>
            <li>• Optimized for A4 printing</li>
            <li>• Includes header with generation date</li>
            <li>• Page breaks between semesters</li>
          </ul>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Table className="w-6 h-6 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">CSV Export</h4>
          </div>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• Structured data format for Excel/Sheets</li>
            <li>• Easy filtering and sorting capabilities</li>
            <li>• Suitable for further analysis</li>
            <li>• Includes all timetable details</li>
            <li>• Compatible with database imports</li>
          </ul>
        </div>
      </div>

      {availableSemesters.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Download className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg mb-2">No timetables available for export</p>
          <p className="text-sm">Generate timetables from the Generator Panel to enable export functionality</p>
        </div>
      )}
    </div>
  );
};

export default ExportManager;