import { ipcMain } from 'electron'
import ResultController from '../controllers/result.controller'

ipcMain.handle('results:getAll', async () => {
  return await ResultController.getAll()
})
ipcMain.handle('results:getById', async (event, id) => {
  return await ResultController.getById(id)
})
ipcMain.handle('results:create', async (event, data) => {
  return await ResultController.create(data)
})
ipcMain.handle('results:delete', async (event, id) => {
  return await ResultController.delete(id)
})

ipcMain.handle('results:getByExamId', async (event, examId) => {
  return await ResultController.getByExamId(examId)
})
