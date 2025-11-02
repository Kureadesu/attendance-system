// controllers/attendanceController.js
import { Attendance, Student, Subject } from '../models/index.js';
import { Op } from 'sequelize';

export const markAttendance = async (req, res) => {
  try {
    const { date, subjectId, attendanceRecords } = req.body;

    // Check if subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Process attendance records
    const results = [];
    
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
        // Update existing record
        await existingAttendance.update({
          status: record.status,
          remarks: record.remarks || ''
        });
        results.push({
          studentNumber: record.studentNumber,
          status: 'updated',
          message: 'Attendance updated'
        });
      } else {
        // Create new record
        await Attendance.create({
          student_number: record.studentNumber,
          subject_id: subjectId,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks || ''
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

export const getAttendanceSummary = async (req, res) => {
  try {
    const { date, subjectId, range = 'month' } = req.query;

    let whereClause = {};
    
    if (date && subjectId) {
      whereClause = {
        date: new Date(date),
        subject_id: parseInt(subjectId)
      };
    } else {
      // Get summary for time range
      const now = new Date();
      let startDate;

      if (range === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (range === 'month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        startDate = new Date(0); // All time
      }

      whereClause.date = { [Op.gte]: startDate };
    }

    const summary = await Attendance.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await Attendance.findAll({
      where: {
        date: today
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.json({
      summary,
      todayStats,
      date: date || 'range',
      range
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

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
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          attributes: ['name', 'schedule', 'room']
        }
      ],
      order: [[Student, 'name', 'ASC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch class attendance' });
  }
};