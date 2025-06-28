import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
// import LabManagement from './pages/LabManagement';
import TimetableGenerator from './pages/TimetableGenerator';
import TimetableView from './pages/TimetableView';
import ConflictViewer from './components/timetable/ConflictViewer';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Remove the Dashboard route since the component is deleted */}
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="generator" element={<TimetableGenerator />} />
          <Route path="view/:semesterId/:sectionId" element={<TimetableView />} />
          <Route path="conflict-checker" element={<ConflictViewer />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
