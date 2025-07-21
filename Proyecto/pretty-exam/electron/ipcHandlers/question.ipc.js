import { ipcMain } from 'electron'
import QuestionController from './../controllers/question.controller'

ipcMain.handle('questions:getAll', async () => {
  return await QuestionController.getAll()
})

ipcMain.handle('questions:create', async (_, data) => {
  try {
    return await QuestionController.create(data)
  } catch (error) {
    console.error('Error creating question:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const createError = new Error('Error al crear la pregunta')
    createError.type = 'CREATE_ERROR'
    throw createError
  }
})

ipcMain.handle('questions:update', async (_, id, data) => {
  try {
    return await QuestionController.update(id, data)
  } catch (error) {
    console.error('Error updating question:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const updateError = new Error('Error al actualizar la pregunta')
    updateError.type = 'UPDATE_ERROR'
    throw updateError
  }
})

ipcMain.handle('questions:delete', async (_, id) => {
  return await QuestionController.delete(id)
})

ipcMain.handle('questions:search', async (_, filters) => {
  return await QuestionController.search(filters)
})

ipcMain.handle('questions:getByCategory', async (_, categoryId) => {
  return await QuestionController.getByCategory(categoryId)
})
