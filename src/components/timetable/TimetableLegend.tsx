import React from 'react';

const TimetableLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-white', text: 'Theory Classes', textColor: 'text-gray-800' },
    { color: 'bg-white', text: 'Lab Sessions', textColor: 'text-gray-800' },
    { color: 'bg-white', text: 'Elective Courses', textColor: 'text-gray-800' },
    { color: 'bg-white', text: 'Placement Training', textColor: 'text-gray-800' },
    { color: 'bg-white', text: 'Break Time', textColor: 'text-gray-800' },
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