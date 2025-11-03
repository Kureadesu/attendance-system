// models/Exemption.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Exemption = sequelize.define('Exemption', {
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
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Optional - can exempt entire subject or specific schedule
    references: {
      model: 'subject_schedules',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  exempted_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admins',
      key: 'id'
    }
  }
}, {
  tableName: 'exemptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['subject_id', 'schedule_id', 'date']
    },
    {
      fields: ['date', 'subject_id']
    }
  ]
});

export default Exemption;
