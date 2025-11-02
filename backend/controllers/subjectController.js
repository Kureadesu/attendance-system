// controllers/subjectController.js
import { Subject } from '../models/index.js';

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['name', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, schedule, room } = req.body;

    const subject = await Subject.create({
      name,
      schedule,
      room
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};