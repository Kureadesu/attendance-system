// controllers/exemptionController.js - SIMPLIFIED VERSION
import { Op } from 'sequelize';
import { Exemption, Subject, SubjectSchedule, Admin } from '../models/index.js';
import { AttendanceLog } from '../models/index.js';

/**
 * Create an exemption for a subject on a specific date
 */
export const createExemption = async (req, res) => {
  try {
    console.log('=== CREATE EXEMPTION START ===');
    const { subjectId, scheduleId, date, reason } = req.body;
    const exemptedBy = req.user.id;

    console.log('Request data:', { subjectId, scheduleId, date, reason, exemptedBy });

    // Validate required fields
    if (!subjectId || !date || !reason) {
      return res.status(400).json({
        error: 'Missing required fields: subjectId, date, and reason are required'
      });
    }

    const subjectIdNum = parseInt(subjectId);
    const scheduleIdNum = scheduleId ? parseInt(scheduleId) : null;
    const exemptionDate = new Date(date);

    // Check if subject exists
    const subject = await Subject.findByPk(subjectIdNum);
    if (!subject) {
      return res.status(404).json({ error: `Subject with ID ${subjectIdNum} not found` });
    }

    // Check if schedule exists (if provided)
    if (scheduleIdNum) {
      const schedule = await SubjectSchedule.findOne({
        where: { id: scheduleIdNum, subject_id: subjectIdNum }
      });
      if (!schedule) {
        return res.status(404).json({ 
          error: `Schedule with ID ${scheduleIdNum} not found for subject ${subjectIdNum}` 
        });
      }
    }

    // Check if admin exists
    const admin = await Admin.findByPk(exemptedBy);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Check for existing exemption (SIMPLIFIED - one per subject per date)
    const existingExemption = await Exemption.findOne({
      where: {
        subject_id: subjectIdNum,
        date: exemptionDate
      }
    });

    if (existingExemption) {
      return res.status(409).json({ 
        error: 'Exemption already exists for this subject on the specified date' 
      });
    }

    // Create exemption
    const exemption = await Exemption.create({
      subject_id: subjectIdNum,
      schedule_id: scheduleIdNum,
      date: exemptionDate,
      reason: reason.trim(),
      exempted_by: exemptedBy
    });

    console.log('✅ Exemption created successfully. ID:', exemption.id);

    // Create log
    try {
      await AttendanceLog.create({
        action: 'exempt',
        subject_id: subjectIdNum,
        schedule_id: scheduleIdNum,
        date: exemptionDate,
        remarks: `Exemption: ${reason}`,
        performed_by: exemptedBy,
        ip_address: req.ip || 'unknown'
      });
    } catch (logError) {
      console.warn('Failed to create attendance log:', logError.message);
    }

    res.status(201).json({
      message: 'Exemption created successfully',
      exemption: {
        id: exemption.id,
        subject_id: exemption.subject_id,
        schedule_id: exemption.schedule_id,
        date: exemption.date,
        reason: exemption.reason,
        exempted_by: exemption.exempted_by,
        created_at: exemption.created_at
      }
    });

  } catch (error) {
    console.error('CREATE EXEMPTION ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.parent) {
      console.error('SQL Error:', error.parent.sqlMessage);
    }

    // Handle specific errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Exemption already exists for this subject on the specified date' 
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Invalid reference. Please check if subject, schedule, and admin exist.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create exemption',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all exemptions with optional filtering
 */
export const getExemptions = async (req, res) => {
  try {
    const { subjectId, startDate, endDate } = req.query;

    const whereClause = {};
    if (subjectId) whereClause.subject_id = subjectId;
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const exemptions = await Exemption.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'code', 'name', 'room']
        },
        {
          model: SubjectSchedule,
          as: 'schedule',
          attributes: ['id', 'day_of_week', 'start_time', 'end_time'],
          required: false
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json(exemptions);
  } catch (error) {
    console.error('Get exemptions error:', error);
    res.status(500).json({ error: 'Failed to fetch exemptions' });
  }
};

/**
 * Delete an exemption
 */
export const deleteExemption = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const exemption = await Exemption.findByPk(id);
    if (!exemption) {
      return res.status(404).json({ error: 'Exemption not found' });
    }

    // Log the deletion
    await AttendanceLog.create({
      action: 'delete',
      subject_id: exemption.subject_id,
      schedule_id: exemption.schedule_id,
      date: exemption.date,
      remarks: `Deleted exemption: ${exemption.reason}`,
      performed_by: adminId,
      ip_address: req.ip
    });

    await exemption.destroy();

    res.json({ message: 'Exemption deleted successfully' });
  } catch (error) {
    console.error('Delete exemption error:', error);
    res.status(500).json({ error: 'Failed to delete exemption' });
  }
};

/**
 * Check if a subject/schedule is exempted on a specific date
 */
export const checkExemption = async (req, res) => {
  try {
    const { subjectId, scheduleId, date } = req.query;

    if (!subjectId || !date) {
      return res.status(400).json({
        error: 'subjectId and date are required'
      });
    }

    // Check for exemptions - with simplified logic
    const exemption = await Exemption.findOne({
      where: {
        subject_id: subjectId,
        date: new Date(date)
      },
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
        }
      ]
    });

    res.json({
      isExempted: !!exemption,
      exemption: exemption
    });
  } catch (error) {
    console.error('Check exemption error:', error);
    res.status(500).json({ error: 'Failed to check exemption status' });
  }
};