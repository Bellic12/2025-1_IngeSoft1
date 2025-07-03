import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Question from './question.model'

const Exam = sequelize.define(
  'Exam',
  {
    exam_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  },
  {
    tableName: 'Exam',
    timestamps: false,
  }
)

Exam.associate = () => {
  Exam.belongsToMany(Question, {
    through: 'ExamQuestion',
    foreignKey: 'exam_id',
    otherKey: 'question_id',
    as: 'questions',
    onDelete: 'CASCADE',
  })
}

export default Exam
