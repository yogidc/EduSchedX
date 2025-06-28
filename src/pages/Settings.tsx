import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isResetInProgress, setIsResetInProgress] = useState(false);
  
  const [settings, setSettings] = useState({
    instituteName: 'ABC Institute of Technology',
    academicYear: '2025-2026',
    hoursPerPeriod: 60,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSave = () => {
    // In a real app, save settings to API or localStorage
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setIsResetInProgress(true);
    // Simulate reset operation
    setTimeout(() => {
      setIsResetInProgress(false);
      alert('All timetables have been reset!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y dark:divide-gray-700">
        {/* General Settings */}
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Institution Name
              </label>
              <input
                type="text"
                name="instituteName"
                value={settings.instituteName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academicYear"
                value={settings.academicYear}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Minutes Per Period
              </label>
              <input
                type="number"
                name="hoursPerPeriod"
                value={settings.hoursPerPeriod}
                onChange={handleInputChange}
                min="30"
                max="120"
                step="5"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Theme
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1 rounded-md ${
                    theme === 'light'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1 rounded-md ${
                    theme === 'dark'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Data Management</h2>
          <div className="space-y-4">
            <button
              onClick={handleReset}
              disabled={isResetInProgress}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-800 text-sm font-medium rounded-md shadow-sm text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetInProgress ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset All Timetables'
              )}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will delete all generated timetables and reset all data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save size={16} className="mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;