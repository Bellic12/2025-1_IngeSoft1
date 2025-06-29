import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Question from './question.model'

const Option = sequelize.define(
  'Option',
  {
    option_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    /** created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },**/
  },
  {
    tableName: 'Option',
    timestamps: false,
  }
)

Option.associate = () => {
  Option.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'question',
  })
}

export default Option
