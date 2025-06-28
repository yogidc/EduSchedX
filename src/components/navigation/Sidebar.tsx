import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Building,
  Settings,
  X,
  Users,
  BookOpen,
  FlaskConical // ✅ Lab icon
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (open && e.target instanceof HTMLElement) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
    } else {
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
    }
  }, [open]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
      isActive
        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
        : 'text-gray-600 hover:text-blue-900 dark:text-gray-400 dark:hover:text-blue-100 hover:bg-gray-100 dark:hover:bg-gray-800'
    );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 z-30 h-screen w-64 border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-transform lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">EduSchedX</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          <NavLink to="/generator" className={navLinkClass}>
            <Calendar size={20} />
            <span>Generate Timetable</span>
          </NavLink>
          <NavLink to="/view" className={navLinkClass}>
            <BookOpen size={20} />
            <span>View Timetables</span>
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            <Users size={20} />
            <span>Admin Panel</span>
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
