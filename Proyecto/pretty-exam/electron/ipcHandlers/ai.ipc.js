import { ipcMain } from 'electron'
import AIController from '../controllers/ai.controller.js'

// Extract text from PDF
ipcMain.handle('ai:extractPdfText', async (_, pdfBuffer) => {
  try {
    console.log('AI IPC: Recibida solicitud de extracción de PDF, buffer size:', pdfBuffer.byteLength)
    const result = await AIController.extractPdfText(pdfBuffer)
    console.log('AI IPC: Extracción completada exitosamente')
    return result
  } catch (error) {
    console.error('AI IPC: Error en extracción de PDF:', error)
    throw error
  }
})

// Generate questions from PDF
ipcMain.handle('ai:generateQuestionsFromPDF', async (_, { pdfBuffer, config }) => {
  return await AIController.generateQuestionsFromPDF(pdfBuffer, config)
})

// Generate questions from text using Gemini AI
ipcMain.handle('ai:generateQuestions', async (_, config) => {
  try {
    console.log('AI IPC: Recibida solicitud de generación de preguntas:', config)
    const result = await AIController.generateQuestions(config)
    console.log('AI IPC: Generación de preguntas completada exitosamente')
    return result
  } catch (error) {
    console.error('AI IPC: Error en generación de preguntas:', error)
    throw error
  }
})

// Explain a question using AI
ipcMain.handle('ai:explainQuestion', async (_, questionId, optionSelectedId) => {
  return await AIController.explainQuestion(questionId, optionSelectedId)
})

// Feedback for an exam
ipcMain.handle('ai:feedbackExam', async (_, examId, resultId) => {
  return await AIController.feedbackExam(examId, resultId)
})
