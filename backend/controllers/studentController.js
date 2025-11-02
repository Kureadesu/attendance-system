// controllers/studentController.js
import { Student, Attendance, Subject } from '../models/index.js';
import { Op } from 'sequelize';

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentNumber } = req.params;
    const { range = 'all' } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (range === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { date: { [Op.gte]: oneWeekAgo } };
    } else if (range === 'month') {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { date: { [Op.gte]: oneMonthAgo } };
    }

    const student = await Student.findOne({
      where: { student_number: studentNumber }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.findAll({
      where: { 
        student_number: studentNumber,
        ...dateFilter
      },
      include: [
        {
          model: Subject,
          attributes: ['name', 'schedule', 'room']
        },
        {
          model: Student,
          attributes: ['name', 'section', 'year_level']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Calculate statistics
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;

    const statistics = {
      total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
      absenceRate: total > 0 ? ((absent / total) * 100).toFixed(1) : 0,
      lateRate: total > 0 ? ((late / total) * 100).toFixed(1) : 0
    };

    res.json({
      student,
      attendance,
      statistics
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
};