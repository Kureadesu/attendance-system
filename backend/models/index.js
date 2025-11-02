// models/index.js
import sequelize from '../config/database.js';
import Student from './Student.js';
import Subject from './Subject.js';
import Attendance from './Attendance.js'; // Add this

// Define associations
Student.hasMany(Attendance, { foreignKey: 'student_number' });
Attendance.belongsTo(Student, { foreignKey: 'student_number' });

Subject.hasMany(Attendance, { foreignKey: 'subject_id' });
Attendance.belongsTo(Subject, { foreignKey: 'subject_id' });

export { sequelize, Student, Subject, Attendance };