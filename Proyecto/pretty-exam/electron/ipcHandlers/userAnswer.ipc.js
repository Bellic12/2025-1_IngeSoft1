import { ipcMain } from 'electron'
import UserAnswerController from '../controllers/userAnswer.controller'

ipcMain.handle('userAnswers:getAll', async () => {
  return await UserAnswerController.getAll()
})
ipcMain.handle('userAnswers:getById', async (event, resultId, questionId) => {
  return await UserAnswerController.getById(resultId, questionId)
})
ipcMain.handle('userAnswers:create', async (event, data) => {
  return await UserAnswerController.create(data)
})
ipcMain.handle('userAnswers:delete', async (event, resultId, questionId) => {
  return await UserAnswerController.delete(resultId, questionId)
})
