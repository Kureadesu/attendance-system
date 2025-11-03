// controllers/subjectController.js
import { Subject, SubjectSchedule } from '../models/index.js';

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [
        {
          model: SubjectSchedule,
          as: 'schedules', // This should match the association alias
          attributes: ['id', 'day_of_week', 'start_time', 'end_time']
        }
      ]
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id, {
      include: [{
        model: SubjectSchedule,
        as: 'schedules',
        attributes: ['id', 'day_of_week', 'start_time', 'end_time']
      }]
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};