import { DataTypes } from 'sequelize'
import sequelize from '../../config/database'
import Result from '../results/result.model'
import Question from '../questions/question.model'
import Option from './option.model'

const UserAnswer = sequelize.define(
  'UserAnswer',
  {
    result_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    question_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    option_id: { type: DataTypes.INTEGER, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  {
    tableName: 'UserAnswer',
    timestamps: false,
  }
)

UserAnswer.associate = () => {
  UserAnswer.belongsTo(Result, { foreignKey: 'result_id', as: 'result', onDelete: 'CASCADE' })
  UserAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question', onDelete: 'CASCADE' })
  UserAnswer.belongsTo(Option, { foreignKey: 'option_id', as: 'option', onDelete: 'CASCADE' })
}

export default UserAnswer
