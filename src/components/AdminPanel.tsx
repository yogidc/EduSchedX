import React, { useState } from 'react';
import { Plus, Users, BookOpen, Building, GraduationCap } from 'lucide-react';
import FacultyManager from './admin/FacultyManager';
import SubjectManager from './admin/SubjectManager';
import SectionManager from './admin/SectionManager';
import RoomManager from './admin/RoomManager';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('faculty');

  const sections = [
    { id: 'faculty', label: 'Faculty', icon: Users, color: 'blue' },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, color: 'emerald' },
    { id: 'sections', label: 'Sections', icon: GraduationCap, color: 'purple' },
    { id: 'rooms', label: 'Rooms', icon: Building, color: 'orange' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'faculty': return <FacultyManager />;
      case 'subjects': return <SubjectManager />;
      case 'sections': return <SectionManager />;
      case 'rooms': return <RoomManager />;
      default: return <FacultyManager />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Panel</h2>
        <p className="text-slate-600">Manage faculty, subjects, sections, and rooms</p>
      </div>

      {/* Section Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-slate-50 p-2 rounded-xl">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? `bg-${section.color}-500 text-white shadow-md`
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="bg-slate-50 rounded-xl p-6">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminPanel;