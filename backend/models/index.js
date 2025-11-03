// models/index.js - Define associations
import sequelize from '../config/database.js';
import Student from './Student.js';
import Subject from './Subject.js';
import SubjectSchedule from './subjectSchedule.js';
import Attendance from './Attendance.js';
import Admin from './Admin.js';

// Subject <-> SubjectSchedule (One-to-Many)
Subject.hasMany(SubjectSchedule, { 
  foreignKey: 'subject_id',
  as: 'schedules'
});
SubjectSchedule.belongsTo(Subject, { 
  foreignKey: 'subject_id',
  as: 'subject'
});

// Attendance associations
Attendance.belongsTo(Student, { 
  foreignKey: 'student_number',
  targetKey: 'student_number',
  as: 'student'
});
Attendance.belongsTo(Subject, { 
  foreignKey: 'subject_id',
  as: 'subject'
});
Attendance.belongsTo(SubjectSchedule, { 
  foreignKey: 'schedule_id',
  as: 'schedule'
});
Attendance.belongsTo(Admin, { 
  foreignKey: 'marked_by',
  as: 'admin'
});

// Student has many attendance records
Student.hasMany(Attendance, { 
  foreignKey: 'student_number',
  sourceKey: 'student_number',
  as: 'attendance_records'
});

// Subject has many attendance records
Subject.hasMany(Attendance, { 
  foreignKey: 'subject_id',
  as: 'attendance_records'
});

export {
  sequelize,
  Student,
  Subject,
  SubjectSchedule,
  Attendance,
  Admin
};