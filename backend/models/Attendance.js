// models/Attendance.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'students',
      key: 'student_number'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subject_schedules',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT
  },
  marked_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'marked_at',
  updatedAt: false
});

export default Attendance;