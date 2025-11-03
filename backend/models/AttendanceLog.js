// models/AttendanceLog.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttendanceLog = sequelize.define('AttendanceLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'delete', 'exempt'),
    allowNull: false
  },
  student_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  old_status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: true
  },
  new_status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'attendance_logs',
  timestamps: true,
  createdAt: 'logged_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['action', 'logged_at']
    },
    {
      fields: ['student_number', 'logged_at']
    },
    {
      fields: ['subject_id', 'logged_at']
    },
    {
      fields: ['performed_by']
    }
  ]
});

export default AttendanceLog;
