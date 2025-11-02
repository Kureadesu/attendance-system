// frontend/src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportStudentPDF = (studentData) => {
  const doc = new jsPDF();
  const student = studentData.attendance[0]?.Student || {};
  const { statistics } = studentData;

  // Title
  doc.setFontSize(20);
  doc.text('Student Attendance Report', 14, 15);

  // Student Information
  doc.setFontSize(12);
  doc.text(`Student: ${student.name}`, 14, 30);
  doc.text(`Student Number: ${studentData.attendance[0]?.student_number}`, 14, 37);
  doc.text(`Section: ${student.section}`, 14, 44);
  doc.text(`Year Level: ${student.year_level}`, 14, 51);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 58);

  // Statistics
  doc.text(`Attendance Rate: ${statistics.attendanceRate}%`, 14, 70);
  doc.text(`Absence Rate: ${statistics.absenceRate}%`, 14, 77);
  doc.text(`Late Rate: ${statistics.lateRate}%`, 14, 84);

  // Table data
  const tableData = studentData.attendance.map(record => [
    new Date(record.date).toLocaleDateString(),
    record.Subject?.name || 'N/A',
    record.status.charAt(0).toUpperCase() + record.status.slice(1),
    record.remarks || '-'
  ]);

  // AutoTable
  doc.autoTable({
    startY: 95,
    head: [['Date', 'Subject', 'Status', 'Remarks']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] }
  });

  // Save the PDF
  doc.save(`attendance-${studentData.attendance[0]?.student_number}.pdf`);
};