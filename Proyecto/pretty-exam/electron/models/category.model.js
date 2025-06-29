import { DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Question from './question.model'

const Category = sequelize.define(
  'Category',
  {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'Category',
    timestamps: false,
  }
)

Category.associate = () => {
  Category.hasMany(Question, {
    foreignKey: 'category_id',
    as: 'questions',
  })
}

export default Category
