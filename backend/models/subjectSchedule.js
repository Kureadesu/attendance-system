// models/SubjectSchedule.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubjectSchedule = sequelize.define('SubjectSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'subject_schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default SubjectSchedule;