import { DataTypes } from 'sequelize'
import sequelize from '../config/database'

const Question = sequelize.define(
  'Question',
  {
    question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    type: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    source: DataTypes.TEXT,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'Question',
    timestamps: false,
  }
)

export default Question
