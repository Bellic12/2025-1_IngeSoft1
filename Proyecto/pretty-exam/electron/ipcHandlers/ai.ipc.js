import { ipcMain } from 'electron'
import AIController from '../controllers/ai.controller.js'

// Explain a question using AI
ipcMain.handle('ai:explainQuestion', async (_, questionId, optionSelectedId) => {
  return await AIController.explainQuestion(questionId, optionSelectedId)
})

// Feedback for an exam
ipcMain.handle('ai:feedbackExam', async (_, examId, resultId) => {
  return await AIController.feedbackExam(examId, resultId)
})
