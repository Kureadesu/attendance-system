import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (students, attendance, date, subject, selectedSchedule) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('ATTENDANCE REPORT', 105, 15, { align: 'center' });

  // Find selected schedule
  const selectedScheduleObj = subject?.schedules?.find(s => s.id === parseInt(selectedSchedule));

  // Format schedule time
  const formatScheduleTime = (schedule) => {
    if (!schedule) return 'N/A';
    const startTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const endTime = new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${schedule.day_of_week} | ${startTime} - ${endTime}`;
  };

  // Subject and Date
  doc.setFontSize(12);
  doc.text(`Subject: ${subject?.name || 'N/A'}`, 14, 25);
  doc.text(`Schedule: ${formatScheduleTime(selectedScheduleObj)}`, 14, 32);
  doc.text(`Room: ${subject?.room || 'N/A'}`, 14, 39);
  doc.text(`Date: ${date}`, 14, 46);
  
  // Attendance statistics
  const present = Object.values(attendance).filter(status => status === 'present').length;
  const absent = Object.values(attendance).filter(status => status === 'absent').length;
  const late = Object.values(attendance).filter(status => status === 'late').length;
  // const totalMarked = present + absent + late;
  
  doc.text(`Total Students: ${students.length}`, 140, 25);
  doc.text(`Present: ${present}`, 140, 32);
  doc.text(`Absent: ${absent}`, 140, 39);
  doc.text(`Late: ${late}`, 140, 46);
  
  // Table data
  const tableData = students.map((student, index) => [
    index + 1,
    student.student_number,
    student.name,
    student.section,
    attendance[student.student_number] || 'Not Marked'
  ]);
  
  // AutoTable
  doc.autoTable({
    startY: 55,
    head: [['No.', 'Student Number', 'Name', 'Section', 'Status']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  // Save the PDF
  const filename = `attendance_${subject?.name || 'report'}_${date}.pdf`;
  doc.save(filename);
};