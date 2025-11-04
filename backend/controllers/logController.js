// controllers/logController.js
import { Op } from 'sequelize';
import { AttendanceLog, Subject, SubjectSchedule, Admin, Student, sequelize } from '../models/index.js';

/**
 * Get all attendance logs with optional filtering
 */
export const getLogs = async (req, res) => {
  try {
    const {
      action,
      studentNumber,
      subjectId,
      performedBy,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    const whereClause = {};

    if (action) whereClause.action = action;
    if (studentNumber) whereClause.student_number = studentNumber;
    if (subjectId) whereClause.subject_id = subjectId;
    if (performedBy) whereClause.performed_by = performedBy;

    if (startDate && endDate) {
      whereClause.logged_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const logs = await AttendanceLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'code', 'name']
        },
        {
          model: SubjectSchedule,
          as: 'schedule',
          attributes: ['id', 'day_of_week', 'start_time', 'end_time']
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['student_number', 'name']
        }
      ],
      order: [['logged_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logs: logs.rows,
      total: logs.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

/**
 * Get log statistics
 */
export const getLogStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const stats = await AttendanceLog.findAll({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        logged_at: {
          [Op.gte]: startDate
        }
      },
      group: ['action'],
      raw: true
    });

    // Get recent logs for activity feed
    const recentLogs = await AttendanceLog.findAll({
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['code', 'name']
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['username', 'full_name']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['student_number', 'name']
        }
      ],
      order: [['logged_at', 'DESC']],
      limit: 10
    });

    res.json({
      mark_present: stats.find(s => s.action === 'create')?.count || 0,
      mark_absent: stats.find(s => s.action === 'create')?.count || 0, // Note: This should be filtered by status, but for now using create count
      mark_late: stats.find(s => s.action === 'create')?.count || 0, // Note: This should be filtered by status, but for now using create count
      recentActivity: recentLogs
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
};
