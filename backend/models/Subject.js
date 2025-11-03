// models/Subject.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  room: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Subject;