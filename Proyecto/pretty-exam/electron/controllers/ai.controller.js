import QuestionController from './question.controller'
import OptionController from './option.controller'
import ExamController from './exam.controller'
import ResultController from './result.controller'
import { boldMarkdownToHtml } from '../utils/markdown'
import { readPdfText } from '../utils/pdfUtils' // Asumiendo que crearemos esta utilidad
const apiKey = null

if (!apiKey) {
  console.log('Gemini API key is not set.')
}

const AIController = {
  // Método para generar preguntas a partir de un PDF
  generateQuestionsFromPDF: async (pdfBuffer, config) => {
    if (!apiKey) {
      throw new Error('Gemini API key is not set.')
    }

    try {
      // Extraer texto del PDF
      const text = await readPdfText(pdfBuffer)

      // Construir el prompt para Gemini
      const prompt = `
        Actúa como un profesor experto y genera preguntas de examen basadas en el siguiente texto:
        "${text}"

        Requisitos:
        - Generar ${config.multipleChoice} preguntas de opción múltiple
        - Generar ${config.trueFalse} preguntas de verdadero/falso
        - Nivel de dificultad: ${config.difficulty}
        - Categoría: ${config.category}

        Las preguntas deben seguir este formato JSON exacto:
        {
          "questions": [
            {
              "text": "Pregunta clara y concisa",
              "type": "${config.multipleChoice > 0 ? 'multiple_choice' : 'true_false'}",
              "difficulty": "${config.difficulty}",
              "category_id": "${config.category}",
              "points": ${config.difficulty === 'facil' ? 10 : config.difficulty === 'medio' ? 15 : 20},
              "explanation": "Explicación breve de por qué la respuesta es correcta",
              "options": [
                {
                  "text": "Opción correcta",
                  "is_correct": true
                },
                {
                  "text": "Opción incorrecta 1",
                  "is_correct": false
                },
                {
                  "text": "Opción incorrecta 2",
                  "is_correct": false
                },
                {
                  "text": "Opción incorrecta 3",
                  "is_correct": false
                }
              ]
            }
          ]
        }
        
        IMPORTANTE:
        1. El campo "text" debe contener la pregunta
        2. Para preguntas true_false, incluir solo dos options con is_correct true o false
        3. Los campos deben coincidir exactamente con los nombres especificados
        4. Mantén las respuestas concisas y claras
        5. Genera EXACTAMENTE el número de preguntas solicitado de cada tipo
      `

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      
      if (!generatedText) {
        throw new Error('No se pudo generar el contenido')
      }

      try {
        const parsedQuestions = JSON.parse(generatedText)
        return parsedQuestions.questions
      } catch (error) {
        throw new Error('Error al parsear las preguntas generadas')
      }
    } catch (error) {
      throw new Error(`Error al generar preguntas: ${error.message}`)
    }
  },

  explainQuestion: async (questionId, optionSelectedId) => {
    if (!apiKey) {
      throw new Error('Gemini API key is not set.')
    }
    let option = {}
    let prompt = ''
    if (optionSelectedId === undefined || optionSelectedId === null) {
      option.text = 'Pregunta no respondida'
      const question = await QuestionController.getById(questionId)
      if (!question) throw new Error('Question not found')
      // Buscar la opción correcta
      const correctOption = question.options.find(opt => opt.is_correct)
      // Prompt: solo explica la respuesta correcta
      prompt = `
        No saludes, no te presentes, no digas que eres una IA.
        Actúa como un profesor experto en el tema.
        El estudiante no respondió la siguiente pregunta de un examen tipo test.
        No uses latex, escribe símbolos matemáticos de manera simple, usa texto plano para fórmulas.

        Pregunta: ${question.text}
        Opciones: 
        ${question.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}. ${opt.text}`).join('\n')}
        Respuesta correcta: ${correctOption ? correctOption.text : 'No disponible'}

        Explica de manera clara y sencilla por qué esta es la respuesta correcta para que el estudiante comprenda el razonamiento.
        También explica por qué las demás respuestas no son correctas.
        Responde en español, de forma muy breve y didáctica.
      `
    } else {
      option = await OptionController.getById(optionSelectedId)
      const question = await QuestionController.getById(questionId)
      if (!question || !option) throw new Error('Question or option not found')
      // Prompt normal
      prompt = `
        No saludes, no te presentes, no digas que eres una IA.
        Actúa como un profesor experto en el tema.
        No uses latex, escribe símbolos matemáticos de manera simple, usa texto plano para fórmulas.
        Opciones: 
        ${question.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}. ${opt.text}`).join('\n')}
        Respuesta seleccionada: ${option.text}

        Explica si la respuesta es correcta o incorrecta, y justifica la explicación para que el estudiante comprenda el razonamiento.
        También explica por qué las demás respuestas no son correctas.
        Responde en español, de forma muy breve y didáctica.
      `
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }
      const data = await response.json()
      // Extraer el texto de la respuesta
      let text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'No se pudo obtener explicación de la IA.'
      text = boldMarkdownToHtml(text)
      return text
    } catch (err) {
      return `Error al comunicarse con Gemini: ${err.message}`
    }
  },

  // Método para retroalimentación del examen
  feedbackExam: async (examId, resultId) => {
    if (!apiKey) {
      throw new Error('Gemini API key is not set.')
    }
    // Obtener el examen con sus preguntas y opciones
    const exam = await ExamController.getById(examId)
    console.log(exam)
    // Obtener el resultado con sus userAnswers
    const result = await ResultController.getById(resultId)
    if (!exam || !result) throw new Error('Exam or result not found')
    // Obtener userAnswers
    const userAnswers = Array.isArray(result.userAnswers) ? result.userAnswers : []
    // Contar correctas e incorrectas
    const correctCount = result.correct_answers
    const incorrectCount = result.incorrect_answers

    // Armar resumen de respuestas
    let resumen = ''
    const questions = Array.isArray(exam.questions) ? exam.questions : []
    questions.forEach((q, idx) => {
      const options = Array.isArray(q.options) ? q.options : []
      const userAnswer = userAnswers.find(ua => ua.question_id === q.question_id)
      const correctOpt = options.find(opt => opt.is_correct)
      resumen += `Pregunta ${idx + 1}: ${q.text || 'Sin texto'}\n`
      resumen += `Opciones: ${options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text || 'Sin texto'}${opt.is_correct ? ' (correcta)' : ''}`).join(' ')}\n`
      const opcionEscogida = userAnswer
        ? options.find(opt => opt.option_id === userAnswer.option_id)?.text || 'Sin texto'
        : 'No respondida'
      resumen += `Opción escogida: ${opcionEscogida}\n`
      resumen += `Respuesta correcta: ${correctOpt ? correctOpt.text || 'Sin texto' : 'No disponible'}\n\n`
    })
    // Prompt para Gemini
    const prompt = `No saludes, no te presentes.
      no digas que eres una IA.
      Actúa como un profesor experto en el tema y en dar retroalimentación de exámenes.
      \n\nResumen del desempeño:\n- Respuestas correctas: ${correctCount}\n- Respuestas incorrectas: ${incorrectCount}\n\n${resumen}\n
      Por favor, da una retroalimentación breve y didáctica sobre el desempeño general del estudiante en este examen, sin explicar cada pregunta.
      Indica en qué aspectos puede mejorar y qué cosas hizo bien.`
    console.log(prompt)
    // Llamar a Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }
      const data = await response.json()
      let text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'No se pudo obtener retroalimentación de la IA.'
      text = boldMarkdownToHtml(text)
      return text
    } catch (err) {
      return `Error al comunicarse con Gemini: ${err.message}`
    }
  },
}

export default AIController
