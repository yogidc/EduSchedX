import jsPDF from 'jspdf';
import { Timetable } from '../types/timetable';
import Papa from 'papaparse';

// Export timetable to PDF
export const exportToPDF = (timetable: Timetable, filename: string): void => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(`Timetable: ${timetable.semester}th Semester - Section ${timetable.section}`, 14, 20);
  
  // Add generation time
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  
  // In a real app, we would draw the timetable grid and fill in the data
  // This is a simplified version for the demo
  pdf.setFontSize(12);
  pdf.text('Days / Times', 14, 40);
  
  // Add days as column headers
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startX = 50;
  const cellWidth = 35;
  
  days.forEach((day, index) => {
    pdf.text(day, startX + index * cellWidth, 40);
  });
  
  // Add time slots as row headers
  let startY = 50;
  const rowHeight = 10;
  
  timetable.timeSlots.forEach((slot, index) => {
    pdf.text(`${slot.startTime}-${slot.endTime}`, 14, startY + index * rowHeight);
  });
  
  // Save the PDF
  pdf.save(`${filename}.pdf`);
};

// Export timetable to CSV
export const exportToCSV = (timetable: Timetable, filename: string): void => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Create header row
  const header = ['Time/Day', ...days];
  
  // Create rows for each time slot
  const rows = timetable.timeSlots.map(slot => {
    const row = [`${slot.startTime}-${slot.endTime}`];
    
    // Add cells for each day
    days.forEach(day => {
      // In a real app, this would fetch the actual schedule data
      row.push(''); // Placeholder for actual data
    });
    
    return row;
  });
  
  // Combine header and rows
  const csvData = [header, ...rows];
  
  // Convert to CSV string
  const csv = Papa.unparse(csvData);
  
  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};