import { Category } from '../models/index'
import {
  validateCategory,
  validateCategoryUpdate,
  validateCategoryId,
  validateCategoryNameUniqueness,
} from '../validations/category.validation.js'

const CategoryController = {
  // Get all categories
  getAll: async () => {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    })
    return categories.map(c => c.get({ plain: true }))
  },

  // Create a new category
  create: async data => {
    // Validar datos de entrada
    const validation = validateCategory(data)
    if (!validation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = validation.errors
      throw error
    }

    // Validar unicidad del nombre
    const existingCategories = await Category.findAll()
    const uniquenessValidation = validateCategoryNameUniqueness(
      data.name,
      existingCategories.map(cat => cat.get({ plain: true }))
    )

    if (!uniquenessValidation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = uniquenessValidation.errors
      throw error
    }

    try {
      const category = await Category.create({
        name: data.name.trim(),
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
    // Validar ID
    const idValidation = validateCategoryId(id)
    if (!idValidation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = idValidation.errors
      throw error
    }

    // Validar datos de actualización
    const validation = validateCategoryUpdate(data)
    if (!validation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = validation.errors
      throw error
    }

    // Validar unicidad del nombre (excluyendo la categoría actual)
    const existingCategories = await Category.findAll({
      where: {
        category_id: { [Category.sequelize.Op.ne]: id },
      },
    })
    const uniquenessValidation = validateCategoryNameUniqueness(
      data.name,
      existingCategories.map(cat => cat.get({ plain: true }))
    )

    if (!uniquenessValidation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = uniquenessValidation.errors
      throw error
    }

    try {
      const [updatedRowsCount] = await Category.update(
        { name: data.name.trim() },
        { where: { category_id: id } }
      )

      if (updatedRowsCount === 0) {
        throw new Error('Category not found')
      }

      const updatedCategory = await Category.findByPk(id)
      return updatedCategory.get({ plain: true })
    } catch (error) {
      // Si es un error de validación, reenviarlo
      if (error.message === 'VALIDATION_ERROR') {
        throw error
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists')
      }
      throw error
    }
  },

  // Delete a category
  delete: async id => {
    const deletedRowsCount = await Category.destroy({
      where: { category_id: id },
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
  },
}

export default CategoryController
