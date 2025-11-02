import sequelize from '../config/database.js';
import Admin from './Admin.js';
import Student from './Student.js';
import Subject from './Subject.js';
import Attendance from './Attendance.js';

// Define associations
Attendance.belongsTo(Student, { 
  foreignKey: 'student_number',
  targetKey: 'student_number'
});

Attendance.belongsTo(Subject, { 
  foreignKey: 'subject_id' 
});

Student.hasMany(Attendance, { 
  foreignKey: 'student_number' 
});

Subject.hasMany(Attendance, { 
  foreignKey: 'subject_id' 
});

export {
  sequelize,
  Admin,
  Student,
  Subject,
  Attendance
};