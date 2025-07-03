import { ipcMain } from 'electron'
import ExamController from './../controllers/exam.controller'

ipcMain.handle('exams:getAll', async () => {
  return await ExamController.getAll()
})

ipcMain.handle('exams:create', async (_, data) => {
  return await ExamController.create(data)
})

ipcMain.handle('exams:update', async (_, id, data) => {
  return await ExamController.update(id, data)
})

ipcMain.handle('exams:delete', async (_, id) => {
  return await ExamController.delete(id)
})
