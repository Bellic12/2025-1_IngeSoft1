import { ipcMain } from 'electron'
import QuestionController from './../controllers/question.controller'

ipcMain.handle('questions:getAll', async () => {
  return await QuestionController.getAll()
})

ipcMain.handle('questions:create', async (_, data) => {
  return await QuestionController.create(data)
})

ipcMain.handle('questions:update', async (_, id, data) => {
  return await QuestionController.update(id, data)
})

ipcMain.handle('questions:delete', async (_, id) => {
  return await QuestionController.delete(id)
})
