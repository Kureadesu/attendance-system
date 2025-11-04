// controllers/attendanceController.js
import { Attendance, Student, Subject, SubjectSchedule, Exemption, AttendanceLog } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Validate if attendance can be marked for a given date and schedule
 */
const validateAttendanceSchedule = async (date, scheduleId) => {
  const schedule = await SubjectSchedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const attendanceDate = new Date(date);
  const dayOfWeek = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });

  if (schedule.day_of_week !== dayOfWeek) {
    throw new Error(`Cannot mark attendance: Class is not scheduled on ${dayOfWeek}`);
  }

  return schedule;
};

/**
 * Mark attendance with schedule validation
 */
export const markAttendance = async (req, res) => {
  try {
    const { date, subjectId, scheduleId, attendanceRecords } = req.body;
    console.log('Mark attendance request:', { date, subjectId, scheduleId, attendanceRecords });

    // Validate required fields
    if (!date || !subjectId || !scheduleId || !attendanceRecords) {
      return res.status(400).json({
        error: 'Missing required fields: date, subjectId, scheduleId, and attendanceRecords are required'
      });
    }

    // Validate schedule matches the date
    try {
      await validateAttendanceSchedule(date, scheduleId);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Check if subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Check if the subject/schedule is exempted on this date
    const exemption = await Exemption.findOne({
      where: {
        subject_id: subjectId,
        date: date,
        [Op.or]: [
          { schedule_id: null }, // Subject-wide exemption
          { schedule_id: scheduleId } // Schedule-specific exemption
        ]
      }
    });
    console.log('Exemption check result:', exemption);

    if (exemption) {
      return res.status(400).json({
        error: `Cannot mark attendance: ${exemption.reason}`
      });
    }

    // Process attendance records
    const results = [];
    const adminId = req.user?.id; // From auth middleware

    for (const record of attendanceRecords) {
      // Check if student exists
      const student = await Student.findOne({
        where: { student_number: record.studentNumber }
      });

      if (!student) {
        results.push({
          studentNumber: record.studentNumber,
          status: 'error',
          message: 'Student not found'
        });
        continue;
      }

      // Check if attendance already exists for this date and subject
      const existingAttendance = await Attendance.findOne({
        where: {
          student_number: record.studentNumber,
          subject_id: subjectId,
          date: new Date(date)
        }
      });

      if (existingAttendance) {
        // Log the update
        await AttendanceLog.create({
          action: 'update',
          student_number: record.studentNumber,
          subject_id: subjectId,
          schedule_id: scheduleId,
          date: new Date(date),
          old_status: existingAttendance.status,
          new_status: record.status,
          remarks: record.remarks || `Updated attendance from ${existingAttendance.status} to ${record.status}`,
          performed_by: adminId,
          ip_address: req.ip
        });

        // Update existing record
        await existingAttendance.update({
          status: record.status,
          remarks: record.remarks || '',
          schedule_id: scheduleId,
          marked_by: adminId
        });
        results.push({
          studentNumber: record.studentNumber,
          status: 'updated',
          message: 'Attendance updated'
        });
      } else {
        // Log the creation
        await AttendanceLog.create({
          action: 'create',
          student_number: record.studentNumber,
          subject_id: subjectId,
          schedule_id: scheduleId,
          date: new Date(date),
          new_status: record.status,
          remarks: record.remarks || 'Initial attendance record',
          performed_by: adminId,
          ip_address: req.ip
        });

        // Create new record
        await Attendance.create({
          student_number: record.studentNumber,
          subject_id: subjectId,
          schedule_id: scheduleId,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks || '',
          marked_by: adminId
        });
        results.push({
          studentNumber: record.studentNumber,
          status: 'created',
          message: 'Attendance recorded'
        });
      }
    }

    res.json({
      message: 'Attendance processed successfully',
      results
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

/**
 * Get attendance summary with date range filtering
 */
export const getAttendanceSummary = async (req, res) => {
  try {
    const { range = 'today' } = req.query;

    let startDate, endDate;
    const now = new Date();

    // Calculate date range
    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
        break;
      default:
        // Handle custom range
        if (range.startsWith('custom')) {
          const params = new URLSearchParams(range.split('?')[1]);
          startDate = new Date(params.get('start_date'));
          endDate = new Date(params.get('end_date'));
        } else {
          startDate = new Date(0);
          endDate = new Date();
        }
    }

    // Get overall statistics
    const totalRecords = await Attendance.count({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const statusCounts = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const present = statusCounts.find(s => s.status === 'present')?.count || 0;
    const absent = statusCounts.find(s => s.status === 'absent')?.count || 0;
    const late = statusCounts.find(s => s.status === 'late')?.count || 0;

    // Student statistics
    const studentStats = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'student_number',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_classes'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'late'],
        [sequelize.literal("ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(id)) * 100, 2)"), 'attendance_rate'],
        [sequelize.literal("ROUND((SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) / COUNT(id)) * 100, 2)"), 'absent_rate'],
        [sequelize.literal("ROUND((SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) / COUNT(id)) * 100, 2)"), 'late_rate']
      ],
      group: ['student_number'],
      raw: true
    });

    // Subject statistics - get attendance data first
    const attendanceData = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'subject_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_records'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absent'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'late'],
        [sequelize.literal("ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(id)) * 100, 2)"), 'attendance_rate'],
        [sequelize.literal("ROUND((SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) / COUNT(id)) * 100, 2)"), 'absent_rate']
      ],
      group: ['subject_id'],
      raw: true
    });

    // Get subject details separately
    const subjectDetails = await Subject.findAll({
      include: [{
        model: SubjectSchedule,
        as: 'schedules',
        attributes: ['day_of_week', 'start_time', 'end_time']
      }]
    });

    // Combine the data
    const subjectStats = attendanceData.map(attendance => {
      const subject = subjectDetails.find(s => s.id === attendance.subject_id);
      return {
        subject_id: attendance.subject_id,
        total_records: attendance.total_records,
        present: attendance.present,
        absent: attendance.absent,
        late: attendance.late,
        attendance_rate: attendance.attendance_rate,
        absent_rate: attendance.absent_rate,
        subject: subject ? {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          room: subject.room,
          schedules: subject.schedules
        } : null
      };
    });

    res.json({
      total: totalRecords,
      present,
      absent,
      late,
      attendanceRate: totalRecords > 0 ? ((present / totalRecords) * 100).toFixed(2) : 0,
      absentRate: totalRecords > 0 ? ((absent / totalRecords) * 100).toFixed(2) : 0,
      lateRate: totalRecords > 0 ? ((late / totalRecords) * 100).toFixed(2) : 0,
      studentStats: {
        all_students: studentStats,
        highest_attendance: studentStats.sort((a, b) => b.attendance_rate - a.attendance_rate).slice(0, 3),
        lowest_attendance: studentStats.sort((a, b) => a.attendance_rate - b.attendance_rate).slice(0, 3),
        highest_absent: studentStats.sort((a, b) => b.absent_rate - a.absent_rate).slice(0, 3),
        highest_late: studentStats.sort((a, b) => b.late_rate - a.late_rate).slice(0, 3)
      },
      subjectStats: {
        all_subjects: subjectStats.map(s => ({
          subject_id: s.subject_id,
          subject_name: s.subject?.name,
          subject_code: s.subject?.code,
          schedules: s.subject?.schedules,
          total_records: s.total_records,
          present: s.present,
          absent: s.absent,
          late: s.late,
          attendance_rate: s.attendance_rate,
          absent_rate: s.absent_rate
        })),
        highest_attendance: subjectStats.sort((a, b) => b.attendance_rate - a.attendance_rate).slice(0, 3).map(s => ({
          subject_id: s.subject_id,
          subject_name: s.subject?.name,
          subject_code: s.subject?.code,
          schedules: s.subject?.schedules,
          total_records: s.total_records,
          present: s.present,
          absent: s.absent,
          late: s.late,
          attendance_rate: s.attendance_rate,
          absent_rate: s.absent_rate
        })),
        highest_absent: subjectStats.sort((a, b) => b.absent_rate - a.absent_rate).slice(0, 3).map(s => ({
          subject_id: s.subject_id,
          subject_name: s.subject?.name,
          subject_code: s.subject?.code,
          schedules: s.subject?.schedules,
          total_records: s.total_records,
          present: s.present,
          absent: s.absent,
          late: s.late,
          attendance_rate: s.attendance_rate,
          absent_rate: s.absent_rate
        })),
        lowest_attendance: subjectStats.sort((a, b) => a.attendance_rate - b.attendance_rate).slice(0, 3).map(s => ({
          subject_id: s.subject_id,
          subject_name: s.subject?.name,
          subject_code: s.subject?.code,
          schedules: s.subject?.schedules,
          total_records: s.total_records,
          present: s.present,
          absent: s.absent,
          late: s.late,
          attendance_rate: s.attendance_rate,
          absent_rate: s.absent_rate
        }))
      },
      dateRange: { startDate, endDate, range }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

/**
 * Get attendance trend for the last 7 days
 */
export const getAttendanceTrend = async (req, res) => {
  try {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const trendData = await Promise.all(
      last7Days.map(async (date) => {
        const records = await Attendance.count({
          where: { date }
        });

        const present = await Attendance.count({
          where: { date, status: 'present' }
        });

        return {
          date,
          total: records,
          present,
          rate: records > 0 ? ((present / records) * 100).toFixed(2) : 0
        };
      })
    );

    res.json(trendData);
  } catch (error) {
    console.error('Get attendance trend error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance trend' });
  }
};

/**
 * Get class attendance for a specific date and subject
 */
export const getClassAttendance = async (req, res) => {
  try {
    const { date, subjectId } = req.query;

    if (!date || !subjectId) {
      return res.status(400).json({ 
        error: 'Date and subjectId are required' 
      });
    }

    const attendance = await Attendance.findAll({
      where: {
        date: new Date(date),
        subject_id: parseInt(subjectId)
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['student_number', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['code', 'name', 'room']
        },
        {
          model: SubjectSchedule,
          as: 'schedule',
          attributes: ['day_of_week', 'start_time', 'end_time']
        }
      ],
      order: [[{ model: Student, as: 'student' }, 'name', 'ASC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch class attendance' });
  }
};
