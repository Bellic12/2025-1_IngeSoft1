import { Category, Question } from '../models/index'

const CategoryController = {
  // Get all categories
  getAll: async () => {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    })
    return categories.map(c => c.get({ plain: true }))
  },

  // Create a new category
  create: async (data) => {
    try {
      const category = await Category.create({
        name: data.name
      })
      return category.get({ plain: true })
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists')
      }
      throw error
    }
  },

  // Update an existing category
  update: async (id, data) => {
    try {
      const [updatedRowsCount] = await Category.update(
        { name: data.name },
        { where: { category_id: id } }
      )
      
      if (updatedRowsCount === 0) {
        throw new Error('Category not found')
      }
      
      const updatedCategory = await Category.findByPk(id)
      return updatedCategory.get({ plain: true })
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists')
      }
      throw error
    }
  },

  // Delete a category
  delete: async (id) => {
    const deletedRowsCount = await Category.destroy({
      where: { category_id: id }
    })
    
    if (deletedRowsCount === 0) {
      throw new Error('Category not found')
    }
    
    return true
  },

  // Check if category name exists
  nameExists: async (name, excludeId = null) => {
    const whereClause = { name }
    if (excludeId) {
      whereClause.category_id = { [Category.sequelize.Op.ne]: excludeId }
    }
    
    const category = await Category.findOne({ where: whereClause })
    return !!category
  }
}

export default CategoryController