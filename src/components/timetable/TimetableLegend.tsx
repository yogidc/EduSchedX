import React from 'react';

const TimetableLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-blue-50 dark:bg-blue-900/20', text: 'Theory Classes', textColor: 'text-blue-800 dark:text-blue-200' },
    { color: 'bg-green-50 dark:bg-green-900/20', text: 'Lab Sessions', textColor: 'text-green-800 dark:text-green-200' },
    { color: 'bg-purple-50 dark:bg-purple-900/20', text: 'Elective Courses', textColor: 'text-purple-800 dark:text-purple-200' },
    { color: 'bg-amber-50 dark:bg-amber-900/20', text: 'Placement Training', textColor: 'text-amber-800 dark:text-amber-200' },
    { color: 'bg-gray-50 dark:bg-gray-800', text: 'Break Time', textColor: 'text-gray-400 dark:text-gray-500' },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Legend</h3>
      <div className="flex flex-wrap gap-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 rounded ${item.color} border border-gray-200 dark:border-gray-700`}></div>
            <span className={`ml-2 text-sm ${item.textColor}`}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableLegend;