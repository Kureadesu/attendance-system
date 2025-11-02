import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^\d{5}[A-Z]{2}-\d{6}$/
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  section: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  year_level: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Student;