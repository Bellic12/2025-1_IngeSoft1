import { DataTypes } from 'sequelize'
import sequelize from '../../config/database'
import Exam from '../exams/exam.model'
import UserAnswer from '../shared/userAnswer.model'

const Result = sequelize.define(
  'Result',
  {
    result_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 100 } },
    correct_answers: { type: DataTypes.INTEGER, allowNull: false },
    incorrect_answers: { type: DataTypes.INTEGER, allowNull: false },
    time_used: { type: DataTypes.INTEGER, allowNull: false },
    taken_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  },
  {
    tableName: 'Result',
    timestamps: false,
  }
)

Result.associate = () => {
  Result.belongsTo(Exam, {
    foreignKey: 'exam_id',
    as: 'exam',
    onDelete: 'CASCADE',
  })
  Result.hasMany(UserAnswer, {
    foreignKey: 'result_id',
    as: 'userAnswers',
    onDelete: 'CASCADE',
  })
}

export default Result
