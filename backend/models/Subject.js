// backend/models/Subject.js
import { DataTypes, QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  schedule: {
    type: DataTypes.STRING(100)
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

const subjects = await sequelize.query('SELECT * FROM subjects', {
  type: QueryTypes.SELECT,
});

const findSubjectByName = async (subjectName) => {
  return await Subject.findOne({ where: { name: `${subjectName}` } });
};

export default Subject;