import { ipcMain } from 'electron'
import QuestionController from './question.controller'

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

ipcMain.handle('questions:search', async (_, filters) => {
  return await QuestionController.search(filters)
})

ipcMain.handle('questions:getByCategory', async (_, categoryId) => {
  return await QuestionController.getByCategory(categoryId)
})
