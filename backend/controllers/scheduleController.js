// controllers/scheduleController.js
import { Subject, SubjectSchedule } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get current class schedule based on current day and time
 */
export const getCurrentSchedule = async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    // Find schedules for current day
    const schedules = await SubjectSchedule.findAll({
      where: {
        day_of_week: dayOfWeek
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['id', 'code', 'name', 'room']
      }],
      order: [['start_time', 'ASC']]
    });

    // Find active class (current time is between start and end time)
    const activeSchedule = schedules.find(schedule => {
      return currentTime >= schedule.start_time && currentTime <= schedule.end_time;
    });

    // Find upcoming classes (within next 2 hours)
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const upcomingTime = twoHoursLater.toTimeString().split(' ')[0];
    
    const upcomingSchedules = schedules.filter(schedule => {
      return currentTime < schedule.start_time && schedule.start_time <= upcomingTime;
    });

    res.json({
      currentDay: dayOfWeek,
      currentTime: currentTime,
      activeSchedule: activeSchedule ? {
        ...activeSchedule.toJSON(),
        isActive: true
      } : null,
      upcomingSchedules: upcomingSchedules.map(s => s.toJSON()),
      allSchedulesToday: schedules.map(s => s.toJSON())
    });
  } catch (error) {
    console.error('Get current schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch current schedule' });
  }
};

/**
 * Get all schedules for a specific day
 */
export const getScheduleByDay = async (req, res) => {
  try {
    const { day } = req.params;

    const schedules = await SubjectSchedule.findAll({
      where: {
        day_of_week: day
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['id', 'code', 'name', 'room']
      }],
      order: [['start_time', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error('Get schedule by day error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

/**
 * Get weekly schedule
 */
export const getWeeklySchedule = async (req, res) => {
  try {
    const schedules = await SubjectSchedule.findAll({
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['id', 'code', 'name', 'room']
      }],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    // Group by day
    const weeklySchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    schedules.forEach(schedule => {
      weeklySchedule[schedule.day_of_week].push(schedule.toJSON());
    });

    res.json(weeklySchedule);
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly schedule' });
  }
};