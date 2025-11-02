// routes/attendance.js - Fix ambiguous column errors
import express from 'express';
import { Attendance, Student, Subject } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

const router = express.Router();

// GET /api/attendance/summary - Enhanced summary with analytics
router.get('/summary', async (req, res) => {
  try {
    const { range = 'today', start_date, end_date } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
    let whereClause = {};
    
    // Enhanced date range filtering
    if (range === 'today') {
      whereClause.date = today;
    } else if (range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.date = { [Op.between]: [weekAgo.toISOString().split('T')[0], today] };
    } else if (range === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      whereClause.date = { [Op.between]: [monthAgo.toISOString().split('T')[0], today] };
    } else if (range === 'custom' && start_date && end_date) {
      whereClause.date = { [Op.between]: [start_date, end_date] };
    }
    
    // Get attendance counts - FIXED: Use specific table references
    const attendanceCounts = await Attendance.findAll({
      where: whereClause,
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('Attendance.id')), 'count'] // Specify table
      ],
      group: ['status'],
      raw: true
    });
    
    // Calculate totals and rates
    const present = attendanceCounts.find(a => a.status === 'present')?.count || 0;
    const absent = attendanceCounts.find(a => a.status === 'absent')?.count || 0;
    const late = attendanceCounts.find(a => a.status === 'late')?.count || 0;
    const total = present + absent + late;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    const absentRate = total > 0 ? Math.round((absent / total) * 100) : 0;
    const lateRate = total > 0 ? Math.round((late / total) * 100) : 0;
    
    // Get top/bottom performers
    const studentStats = await getStudentAttendanceStats(whereClause);
    const subjectStats = await getSubjectAttendanceStats(whereClause);
    
    res.json({
      present,
      absent,
      late,
      total,
      attendanceRate,
      absentRate,
      lateRate,
      studentStats,
      subjectStats
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

// Helper function for student statistics - FIXED: Specify table names
async function getStudentAttendanceStats(whereClause) {
  const studentStats = await Attendance.findAll({
    where: whereClause,
    attributes: [
      'student_number',
      [Sequelize.fn('COUNT', Sequelize.col('Attendance.id')), 'total_classes'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'present' THEN 1 ELSE 0 END")), 'present'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'absent' THEN 1 ELSE 0 END")), 'absent'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'late' THEN 1 ELSE 0 END")), 'late']
    ],
    include: [{
      model: Student,
      attributes: ['name', 'section']
    }],
    group: ['Attendance.student_number'], // Specify table
    having: Sequelize.literal('total_classes > 0'),
    raw: true
  });
  
  // Calculate rates and find top/bottom performers
  const studentsWithRates = studentStats.map(stat => {
    const total = parseInt(stat.total_classes);
    const present = parseInt(stat.present) || 0;
    const absent = parseInt(stat.absent) || 0;
    const late = parseInt(stat.late) || 0;
    
    return {
      student_number: stat.student_number,
      student_name: stat['Student.name'],
      section: stat['Student.section'],
      total_classes: total,
      present,
      absent,
      late,
      attendance_rate: total > 0 ? Math.round((present / total) * 100) : 0,
      absent_rate: total > 0 ? Math.round((absent / total) * 100) : 0,
      late_rate: total > 0 ? Math.round((late / total) * 100) : 0
    };
  });
  
  const sortedByAttendance = [...studentsWithRates].sort((a, b) => b.attendance_rate - a.attendance_rate);
  const sortedByAbsent = [...studentsWithRates].sort((a, b) => b.absent_rate - a.absent_rate);
  const sortedByLate = [...studentsWithRates].sort((a, b) => b.late_rate - a.late_rate);
  
  return {
    highest_attendance: sortedByAttendance.slice(0, 5),
    lowest_attendance: sortedByAttendance.slice(-5).reverse(),
    highest_absent: sortedByAbsent.slice(0, 5),
    highest_late: sortedByLate.slice(0, 5),
    all_students: studentsWithRates
  };
}

// Helper function for subject statistics - FIXED: Specify table names
async function getSubjectAttendanceStats(whereClause) {
  const subjectStats = await Attendance.findAll({
    where: whereClause,
    attributes: [
      'subject_id',
      [Sequelize.fn('COUNT', Sequelize.col('Attendance.id')), 'total_records'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'present' THEN 1 ELSE 0 END")), 'present'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'absent' THEN 1 ELSE 0 END")), 'absent'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN Attendance.status = 'late' THEN 1 ELSE 0 END")), 'late']
    ],
    include: [{
      model: Subject,
      attributes: ['name', 'schedule']
    }],
    group: ['Attendance.subject_id'], // Specify table
    having: Sequelize.literal('total_records > 0'),
    raw: true
  });
  
  const subjectsWithRates = subjectStats.map(stat => {
    const total = parseInt(stat.total_records);
    const present = parseInt(stat.present) || 0;
    const absent = parseInt(stat.absent) || 0;
    const late = parseInt(stat.late) || 0;
    
    return {
      subject_id: stat.subject_id,
      subject_name: stat['Subject.name'],
      schedule: stat['Subject.schedule'],
      total_records: total,
      present,
      absent,
      late,
      attendance_rate: total > 0 ? Math.round((present / total) * 100) : 0,
      absent_rate: total > 0 ? Math.round((absent / total) * 100) : 0,
      late_rate: total > 0 ? Math.round((late / total) * 100) : 0
    };
  });
  
  const sortedByAttendance = [...subjectsWithRates].sort((a, b) => b.attendance_rate - a.attendance_rate);
  const sortedByAbsent = [...subjectsWithRates].sort((a, b) => b.absent_rate - a.absent_rate);
  const sortedByLate = [...subjectsWithRates].sort((a, b) => b.late_rate - a.late_rate);
  
  return {
    highest_attendance: sortedByAttendance.slice(0, 5),
    lowest_attendance: sortedByAttendance.slice(-5).reverse(),
    highest_absent: sortedByAbsent.slice(0, 5),
    highest_late: sortedByLate.slice(0, 5),
    all_subjects: subjectsWithRates
  };
}

// POST /api/attendance/mark - Mark attendance
router.post('/mark', async (req, res) => {
  try {
    const { date, subject_id, records } = req.body;
    
    const attendanceRecords = [];
    for (const record of records) {
      const [attendance, created] = await Attendance.upsert({
        student_number: record.student_number,
        subject_id: subject_id,
        date: date,
        status: record.status
      });
      attendanceRecords.push(attendance);
    }
    
    res.json({ 
      success: true, 
      message: `Attendance marked successfully for ${attendanceRecords.length} students`
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// GET /api/attendance/subject/:subjectId - Get attendance for a subject
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date } = req.query;
    
    const whereClause = { subject_id: subjectId };
    if (date) whereClause.date = date;
    
    const attendanceRecords = await Attendance.findAll({
      where: whereClause,
      include: [{
        model: Student,
        attributes: ['name', 'section']
      }]
    });
    
    const formattedRecords = attendanceRecords.map(record => ({
      student_number: record.student_number,
      status: record.status,
      student_name: record.Student?.name,
      section: record.Student?.section
    }));
    
    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching subject attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

export default router;