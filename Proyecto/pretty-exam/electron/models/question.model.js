import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Category from './category.model'
import Option from './option.model'
import Exam from './exam.model'

const Question = sequelize.define(
  'Question',
  {
    question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    category_id: DataTypes.INTEGER,
    source: {
      type: DataTypes.STRING,
      defaultValue: 'manual',
      allowNull: true,
      validate: {
        isIn: [['manual', 'generated']],
      },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  },
  {
    tableName: 'Question',
    timestamps: false,
  }
)

Question.associate = () => {
  Question.hasMany(Option, {
    foreignKey: 'question_id',
    onDelete: 'CASCADE',
    as: 'options',
  })
  Question.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
  })
  Question.belongsToMany(Exam, {
    through: 'ExamQuestion',
    foreignKey: 'question_id',
    otherKey: 'exam_id',
    timestamps: false,
    as: 'exams',
    onDelete: 'CASCADE',
  })
}

export default Question
