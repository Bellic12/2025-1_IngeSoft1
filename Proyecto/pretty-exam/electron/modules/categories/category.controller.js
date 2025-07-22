import { Category } from '../shared/associations'
import {
  validateCategory,
  validateCategoryUpdate,
  validateCategoryId,
  validateCategoryNameUniqueness,
  validateBulkCategories,
} from './category.validation.js'

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
    try {
      // Validar los datos de la categoría
      const validation = validateCategory(data)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Obtener todas las categorías existentes para validar unicidad
      const existingCategories = await Category.findAll({
        attributes: ['category_id', 'name'],
      })

      // Validar unicidad del nombre
      const uniquenessValidation = validateCategoryNameUniqueness(
        data.name,
        existingCategories.map(c => c.get({ plain: true }))
      )
      if (!uniquenessValidation.isValid) {
        throw new Error(uniquenessValidation.errors.join(', '))
      }

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
    try {
      // Validar el ID de la categoría
      const idValidation = validateCategoryId(id)
      if (!idValidation.isValid) {
        throw new Error(idValidation.errors.join(', '))
      }

      // Validar los datos de actualización
      const updateValidation = validateCategoryUpdate(data)
      if (!updateValidation.isValid) {
        throw new Error(updateValidation.errors.join(', '))
      }

      // Verificar que la categoría existe
      const existingCategory = await Category.findByPk(id)
      if (!existingCategory) {
        throw new Error('Category not found')
      }

      // Si se está actualizando el nombre, validar unicidad
      if (data.name) {
        const allCategories = await Category.findAll({
          attributes: ['category_id', 'name'],
        })

        const uniquenessValidation = validateCategoryNameUniqueness(
          data.name,
          allCategories.map(c => c.get({ plain: true })),
          parseInt(id)
        )
        if (!uniquenessValidation.isValid) {
          throw new Error(uniquenessValidation.errors.join(', '))
        }
      }

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
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists')
      }
      throw error
    }
  },

  // Delete a category
  delete: async id => {
    // Validar el ID de la categoría
    const idValidation = validateCategoryId(id)
    if (!idValidation.isValid) {
      throw new Error(idValidation.errors.join(', '))
    }

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

  // Create multiple categories
  createBulk: async categoriesData => {
    try {
      // Validar los datos de las categorías
      const validation = validateBulkCategories(categoriesData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Obtener todas las categorías existentes para validar unicidad
      const existingCategories = await Category.findAll({
        attributes: ['category_id', 'name'],
      })
      const existingCategoriesPlain = existingCategories.map(c => c.get({ plain: true }))

      // Validar unicidad de cada nombre con las categorías existentes
      for (const categoryData of categoriesData) {
        const uniquenessValidation = validateCategoryNameUniqueness(
          categoryData.name,
          existingCategoriesPlain
        )
        if (!uniquenessValidation.isValid) {
          throw new Error(`${categoryData.name}: ${uniquenessValidation.errors.join(', ')}`)
        }
      }

      // Crear las categorías
      const createdCategories = await Category.bulkCreate(
        categoriesData.map(data => ({ name: data.name.trim() })),
        { returning: true }
      )

      return createdCategories.map(c => c.get({ plain: true }))
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('One or more category names already exist')
      }
      throw error
    }
  },
}

export default CategoryController
