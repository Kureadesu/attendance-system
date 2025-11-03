// models/index.js - Complete associations
import sequelize from '../config/database.js';
import Student from './Student.js';
import Subject from './Subject.js';
import SubjectSchedule from './SubjectSchedule.js';
import Attendance from './Attendance.js';
import Admin from './Admin.js';
import Exemption from './Exemption.js';
import AttendanceLog from './AttendanceLog.js';

// ==================== SUBJECT ASSOCIATIONS ====================
Subject.hasMany(SubjectSchedule, {
  foreignKey: 'subject_id',
  as: 'schedules'
});

SubjectSchedule.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject'
});

// ==================== EXEMPTION ASSOCIATIONS ====================
Exemption.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject'
});

Exemption.belongsTo(SubjectSchedule, {
  foreignKey: 'schedule_id',
  as: 'schedule'
});

Exemption.belongsTo(Admin, {
  foreignKey: 'exempted_by',
  as: 'admin'
});

Subject.hasMany(Exemption, {
  foreignKey: 'subject_id',
  as: 'exemptions'
});

SubjectSchedule.hasMany(Exemption, {
  foreignKey: 'schedule_id',
  as: 'exemptions'
});

Admin.hasMany(Exemption, {
  foreignKey: 'exempted_by',
  as: 'exemptions'
});

// ==================== ATTENDANCE ASSOCIATIONS ====================
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

Student.hasMany(Attendance, {
  foreignKey: 'student_number',
  sourceKey: 'student_number',
  as: 'attendance_records'
});

Subject.hasMany(Attendance, {
  foreignKey: 'subject_id',
  as: 'attendances'
});

SubjectSchedule.hasMany(Attendance, {
  foreignKey: 'schedule_id',
  as: 'attendances'
});

// ==================== ATTENDANCE LOG ASSOCIATIONS ====================
AttendanceLog.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject'
});

AttendanceLog.belongsTo(SubjectSchedule, {
  foreignKey: 'schedule_id',
  as: 'schedule'
});

AttendanceLog.belongsTo(Admin, {
  foreignKey: 'performed_by',
  as: 'admin'
});

AttendanceLog.belongsTo(Student, {
  foreignKey: 'student_number',
  targetKey: 'student_number',
  as: 'student'
});

Subject.hasMany(AttendanceLog, {
  foreignKey: 'subject_id',
  as: 'attendance_logs'
});

SubjectSchedule.hasMany(AttendanceLog, {
  foreignKey: 'schedule_id',
  as: 'attendance_logs'
});

Admin.hasMany(AttendanceLog, {
  foreignKey: 'performed_by',
  as: 'attendance_logs'
});

Student.hasMany(AttendanceLog, {
  foreignKey: 'student_number',
  sourceKey: 'student_number',
  as: 'attendance_logs'
});

export {
  sequelize,
  Student,
  Subject,
  SubjectSchedule,
  Attendance,
  Admin,
  Exemption,
  AttendanceLog
};