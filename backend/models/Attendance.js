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
    allowNull: false
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false
});

export default Attendance;