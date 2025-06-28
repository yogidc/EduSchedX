import React, { useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Define semesters locally
const semesters = ['1st', '3rd', '5th', '7th'];

const SectionManager: React.FC = () => {
  const { sections, addSection, updateSection, deleteSection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    semester: '3rd',
    batches: [] as string[]
  });

  const generateBatches = (sectionName: string) => {
    return Array.from({ length: 5 }, (_, i) => `${sectionName}${i + 1}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const batches = generateBatches(formData.name);
    
    if (editingSection) {
      updateSection(editingSection.id, {
        ...editingSection,
        ...formData,
        batches
      });
    } else {
      addSection({
        id: Date.now().toString(),
        ...formData,
        batches
      });
    }

    setFormData({ name: '', semester: '3rd', batches: [] });
    setEditingSection(null);
    setIsModalOpen(false);
  };

  const handleEdit = (section: any) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      semester: section.semester,
      batches: section.batches || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteSection(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Section Management</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Section List */}
      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-slate-900">Section {section.name}</h4>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {section.semester} Semester
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Batches: {section.batches?.join(', ') || 'No batches'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(section)}
                  className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No sections added yet</p>
            <p className="text-sm">Click "Add Section" to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSection ? 'Edit Section' : 'Add Section'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="A, B, C, etc."
                  maxLength={1}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-600">
                  Batches will be auto-generated: {formData.name ? generateBatches(formData.name).join(', ') : 'Enter section name to preview'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSection(null);
                    setFormData({ name: '', semester: '3rd', batches: [] });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {editingSection ? 'Update' : 'Add'} Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionManager;