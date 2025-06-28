import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RoomManager: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'class' as 'class' | 'lab',
    dailyUsageLimit: 6
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRoom) {
      updateRoom(editingRoom.id, {
        ...editingRoom,
        ...formData
      });
    } else {
      addRoom({
        id: Date.now().toString(),
        ...formData
      });
    }

    setFormData({ name: '', type: 'class', dailyUsageLimit: 6 });
    setEditingRoom(null);
    setIsModalOpen(false);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      dailyUsageLimit: room.dailyUsageLimit
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoom(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Room Management</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Room List */}
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  room.type === 'class' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  <Building className={`w-5 h-5 ${
                    room.type === 'class' ? 'text-orange-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-slate-900">{room.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      room.type === 'class' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {room.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Daily usage limit: {room.dailyUsageLimit} hours
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Building className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No rooms added yet</p>
            <p className="text-sm">Click "Add Room" to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'class' | 'lab' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="class">Classroom</option>
                  <option value="lab">Laboratory</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Daily Usage Limit (hours)
                </label>
                <select
                  value={formData.dailyUsageLimit}
                  onChange={(e) => setFormData({ ...formData, dailyUsageLimit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={4}>4 hours</option>
                  <option value={5}>5 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={7}>7 hours</option>
                  <option value={8}>8 hours</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRoom(null);
                    setFormData({ name: '', type: 'class', dailyUsageLimit: 6 });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingRoom ? 'Update' : 'Add'} Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;