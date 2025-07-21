import { ipcMain } from 'electron'
import ExamController from './../controllers/exam.controller'

ipcMain.handle('exams:getAll', async () => {
  return await ExamController.getAll()
})

ipcMain.handle('exams:getById', async (_, id) => {
  return await ExamController.getById(id)
})

ipcMain.handle('exams:create', async (_, data) => {
  try {
    return await ExamController.create(data)
  } catch (error) {
    console.error('Error creating exam:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const createError = new Error('Error al crear el examen')
    createError.type = 'CREATE_ERROR'
    throw createError
  }
})

ipcMain.handle('exams:update', async (_, id, data) => {
  try {
    return await ExamController.update(id, data)
  } catch (error) {
    console.error('Error updating exam:', error)

    if (error.message === 'VALIDATION_ERROR') {
      const validationError = new Error('Errores de validación')
      validationError.type = 'VALIDATION_ERROR'
      validationError.errors = error.fields
      throw validationError
    }

    const updateError = new Error('Error al actualizar el examen')
    updateError.type = 'UPDATE_ERROR'
    throw updateError
  }
})

ipcMain.handle('exams:delete', async (_, id) => {
  return await ExamController.delete(id)
})

ipcMain.handle('exams:getQuestions', async (_, examId) => {
  return await ExamController.getQuestions(examId)
})

ipcMain.handle('exams:addQuestions', async (_, examId, questionIds) => {
  return await ExamController.addQuestions(examId, questionIds)
})

ipcMain.handle('exams:removeQuestions', async (_, examId, questionIds) => {
  return await ExamController.removeQuestions(examId, questionIds)
})
