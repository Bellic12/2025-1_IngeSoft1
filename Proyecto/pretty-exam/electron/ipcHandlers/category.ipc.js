import { ipcMain } from 'electron'
import CategoryController from '../controllers/category.controller.js'

// Get all categories
ipcMain.handle('categories:getAll', async () => {
  return await CategoryController.getAll()
})

// Create a new category
ipcMain.handle('categories:create', async (_, data) => {
  try {
    return await CategoryController.create(data)
  } catch (error) {
    console.error('Error creating category:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const createError = new Error('Error al crear la categoría')
    createError.type = 'CREATE_ERROR'
    throw createError
  }
})

// Update an existing category
ipcMain.handle('categories:update', async (_, id, data) => {
  try {
    return await CategoryController.update(id, data)
  } catch (error) {
    console.error('Error updating category:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const updateError = new Error('Error al actualizar la categoría')
    updateError.type = 'UPDATE_ERROR'
    throw updateError
  }
})

// Delete a category
ipcMain.handle('categories:delete', async (_, id) => {
  return await CategoryController.delete(id)
})

// Check if category name exists
ipcMain.handle('categories:nameExists', async (_, name, excludeId = null) => {
  return await CategoryController.nameExists(name, excludeId)
})
