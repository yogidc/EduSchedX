import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="p-2 rounded-md lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-2 text-xl font-bold text-blue-900 dark:text-blue-400 lg:ml-0">
          EduSchedX
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;