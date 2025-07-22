import { ipcMain } from 'electron'
import ExamController from './exam.controller'

ipcMain.handle('exams:getAll', async () => {
  return await ExamController.getAll()
})

ipcMain.handle('exams:getById', async (_, id) => {
  return await ExamController.getById(id)
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

ipcMain.handle('exams:getQuestions', async (_, examId) => {
  return await ExamController.getQuestions(examId)
})

ipcMain.handle('exams:addQuestions', async (_, examId, questionIds) => {
  return await ExamController.addQuestions(examId, questionIds)
})

ipcMain.handle('exams:removeQuestions', async (_, examId, questionIds) => {
  return await ExamController.removeQuestions(examId, questionIds)
})
