import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Timetable } from '../types/timetable';
import Papa from 'papaparse';

// Export timetable to PDF
export const exportToPDF = (timetable: Timetable, filename: string): void => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  pdf.setFontSize(16);
  pdf.text(`Timetable: ${timetable.semester}th Semester - Section ${timetable.section}`, 14, 20);
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  pdf.setFontSize(12);
  pdf.text('Days / Times', 14, 40);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startX = 50;
  const cellWidth = 35;
  days.forEach((day, index) => {
    pdf.text(day, startX + index * cellWidth, 40);
  });
  const startY = 50;
  const rowHeight = 10;
  timetable.timeSlots.forEach((slot, index) => {
    pdf.text(`${slot.startTime}-${slot.endTime}`, 14, startY + index * rowHeight);
  });
  pdf.save(`${filename}.pdf`);
};

// Export timetable to CSV
export const exportToCSV = (timetable: Timetable, filename: string): void => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const header = ['Time/Day', ...days];
  const rows = timetable.timeSlots.map(slot => {
    const row = [`${slot.startTime}-${slot.endTime}`];
    days.forEach(day => {
      row.push('');
    });
    return row;
  });
  const csvData = [header, ...rows];
  const csv = Papa.unparse(csvData);
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

// Helper: Generate grid data
export function generateTimetableGridData(timetable: Timetable, options?: { showFaculty?: boolean; showRoom?: boolean }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return timetable.timeSlots.map(slot => {
    return days.map(day => {
      const cell = timetable.days[day]?.[slot.id];
      if (!cell) return '';
      if (typeof cell === 'string') return cell;
      if (cell.type === 'Break') return 'Break';
      let text = cell.subjectId || '';
      if (options?.showFaculty && cell.facultyId) text += `\n(${cell.facultyId})`;
      if (options?.showRoom && cell.roomId) text += `\n[${cell.roomId}]`;
      return text;
    });
  });
}

// Enhanced export to PDF with grid data
export function exportTimetableToPDFWithData(timetable: Timetable, filename: string, options?: { showFaculty?: boolean; showRoom?: boolean }) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startX = 30;
  const startY = 40;
  const cellWidth = 40;
  const rowHeight = 14;

  pdf.setFontSize(16);
  pdf.text(`Timetable: ${timetable.semester}th Semester - Section ${timetable.section}`, 14, 20);
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  pdf.setFontSize(12);
  pdf.text('Time/Day', 14, startY + rowHeight / 2);
  days.forEach((day, i) => {
    pdf.text(day, startX + i * cellWidth + cellWidth / 2, startY + rowHeight / 2, { align: 'center' });
  });

  const grid = generateTimetableGridData(timetable, options);
  timetable.timeSlots.forEach((slot, rowIdx) => {
    const y = startY + (rowIdx + 1) * rowHeight;
    pdf.text(`${slot.startTime}-${slot.endTime}`, 14, y + rowHeight / 2);
    days.forEach((day, colIdx) => {
      const x = startX + colIdx * cellWidth;
      pdf.rect(x, y, cellWidth, rowHeight);
      const cellText = grid[rowIdx][colIdx] || '';
      pdf.setFontSize(10);
      pdf.text(cellText, x + cellWidth / 2, y + rowHeight / 2 + 2, { align: 'center', maxWidth: cellWidth - 4 });
    });
  });

  pdf.save(`${filename}.pdf`);
}

// CSV with data
export function exportTimetableToCSVWithData(timetable: Timetable, filename: string, options?: { showFaculty?: boolean; showRoom?: boolean }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const header = ['Time/Day', ...days];
  const grid = generateTimetableGridData(timetable, options);
  const rows = timetable.timeSlots.map((slot, i) => {
    return [`${slot.startTime}-${slot.endTime}`, ...grid[i].map(cell => cell ?? '')];
  });
  const csvData = [header, ...rows];
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Blob
export function generatePDFBlob(timetable: Timetable, options?: { showFaculty?: boolean; showRoom?: boolean }) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startX = 30;
  const startY = 40;
  const cellWidth = 40;
  const rowHeight = 14;
  pdf.setFontSize(16);
  pdf.text(`Timetable: ${timetable.semester}th Semester - Section ${timetable.section}`, 14, 20);
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  pdf.setFontSize(12);
  pdf.text('Time/Day', 14, startY + rowHeight / 2);
  days.forEach((day, i) => {
    pdf.text(day, startX + i * cellWidth + cellWidth / 2, startY + rowHeight / 2, { align: 'center' });
  });
  const grid = generateTimetableGridData(timetable, options);
  timetable.timeSlots.forEach((slot, rowIdx) => {
    const y = startY + (rowIdx + 1) * rowHeight;
    pdf.text(`${slot.startTime}-${slot.endTime}`, 14, y + rowHeight / 2);
    days.forEach((day, colIdx) => {
      const x = startX + colIdx * cellWidth;
      pdf.rect(x, y, cellWidth, rowHeight);
      const cellText = grid[rowIdx][colIdx] || '';
      pdf.setFontSize(10);
      pdf.text(cellText, x + cellWidth / 2, y + rowHeight / 2 + 2, { align: 'center', maxWidth: cellWidth - 4 });
    });
  });
  return Promise.resolve(pdf.output('blob'));
}

// CSV preview string
export function generateCSVString(timetable: Timetable, options?: { showFaculty?: boolean; showRoom?: boolean }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const header = ['Time/Day', ...days];
  const grid = generateTimetableGridData(timetable, options);
  const rows = timetable.timeSlots.map((slot, i) => {
    return [`${slot.startTime}-${slot.endTime}`, ...grid[i].map(cell => cell ?? '')];
  });
  const csvData = [header, ...rows];
  return Papa.unparse(csvData);
}

// Final PDF with AutoTable and enhanced color design
export function exportTimetableToPDFWithAutoTable(
  timetable: Timetable,
  filename: string,
  options?: { showFaculty?: boolean; showRoom?: boolean }
) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  doc.setFontSize(16);
  doc.text(`Timetable: ${timetable.semester}th Semester - Section ${timetable.section}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  const head = [['Time/Day', ...days]];
  const grid = generateTimetableGridData(timetable, options);
  const body = timetable.timeSlots.map((slot, i) => {
    return [`${slot.startTime}-${slot.endTime}`, ...grid[i].map(cell => cell ?? '')];
  });

  // @ts-ignore
  doc.autoTable({
    head,
    body,
    startY: 24,
    styles: {
      fontSize: 18,
      font: 'helvetica',
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      textColor: [0, 0, 0],
      cellPadding: 2,
      lineColor: [0, 0, 0], // Black border
      lineWidth: 0.5,
      fillColor: [255, 255, 255], // White background
    },
    headStyles: {
      fillColor: [33, 64, 154],
      textColor: 255,
      fontStyle: 'bold',
      font: 'helvetica',
    },
    didParseCell: function (data: any) {
      if (data.section === 'body') {
        data.cell.styles.fillColor = [255, 255, 255]; // White for all cells
        data.cell.styles.textColor = [0, 0, 0]; // Black text
        data.cell.styles.fontStyle = 'normal';
        data.cell.styles.font = 'helvetica';
        data.cell.styles.lineColor = [0, 0, 0]; // Black border
        data.cell.styles.lineWidth = 0.5;
      }
    },
  });

  doc.save(`${filename}.pdf`);
}
