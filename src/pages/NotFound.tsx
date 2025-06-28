import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Home size={16} className="mr-2" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;