import React, { useState } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FacultyManager: React.FC = () => {
  const { faculty, addFaculty, updateFaculty, deleteFaculty, facultyList, setFacultyList } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    maxHoursPerDay: 4
  });
  const [newFaculty, setNewFaculty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFaculty) {
      updateFaculty(editingFaculty.id, {
        ...editingFaculty,
        ...formData
      });
    } else {
      addFaculty({
        id: Date.now().toString(),
        ...formData,
        subjects: []
      });
    }

    setFormData({ name: '', maxHoursPerDay: 4 });
    setEditingFaculty(null);
    setIsModalOpen(false);
  };

  const handleEdit = (facultyMember: any) => {
    setEditingFaculty(facultyMember);
    setFormData({
      name: facultyMember.name,
      maxHoursPerDay: facultyMember.maxHoursPerDay
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      deleteFaculty(id);
    }
  };

  const handleAdd = () => {
    const name = newFaculty.trim();
    if (name && !facultyList.includes(name)) {
      setFacultyList([...facultyList, name]);
      setNewFaculty('');
    }
  };

  const handleRemove = (name: string) => {
    setFacultyList(facultyList.filter(f => f !== name));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Faculty Management</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty</span>
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Constraint:</strong> Each faculty member can teach only one theory subject per semester to ensure proper workload distribution and avoid conflicts.
        </p>
      </div>

      {/* Faculty List */}
      <div className="grid gap-4">
        {faculty.map((facultyMember) => (
          <div key={facultyMember.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{facultyMember.name}</h4>
                  <p className="text-sm text-slate-600">
                    Max hours per day: {facultyMember.maxHoursPerDay}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(facultyMember)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(facultyMember.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faculty.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No faculty members added yet</p>
            <p className="text-sm">Click "Add Faculty" to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Hours per Day
                </label>
                <select
                  value={formData.maxHoursPerDay}
                  onChange={(e) => setFormData({ ...formData, maxHoursPerDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={5}>5 hours</option>
                  <option value={6}>6 hours</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingFaculty(null);
                    setFormData({ name: '', maxHoursPerDay: 4 });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingFaculty ? 'Update' : 'Add'} Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManager;