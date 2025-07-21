import QuestionController from './question.controller'
import OptionController from './option.controller'
import ExamController from './exam.controller'
import ResultController from './result.controller'
import { boldMarkdownToHtml } from '../utils/markdown'
import { readPdfText } from '../utils/pdfUtils'

const apiKey = null

if (!apiKey) {
  console.log('Gemini API key is not set.')
}

const AIController = {
  // Método para extraer texto del PDF
  extractPdfText: async pdfBuffer => {
    try {
      console.log('AIController: Iniciando extracción de PDF, buffer size:', pdfBuffer.byteLength)
      
      // Validar que el buffer no esté vacío
      if (!pdfBuffer || pdfBuffer.byteLength === 0) {
        throw new Error('Buffer de PDF vacío o inválido')
      }
      
      // Verificar que sea un PDF válido (debe comenzar con %PDF)
      const header = new Uint8Array(pdfBuffer.slice(0, 4))
      const headerString = String.fromCharCode(...header)
      if (!headerString.startsWith('%PDF')) {
        throw new Error('El archivo no parece ser un PDF válido')
      }
      
      console.log('AIController: PDF header válido:', headerString)
      
      const result = await readPdfText(pdfBuffer)
      console.log('AIController: Extracción exitosa')
      console.log('AIController: Páginas:', result.pages)
      console.log('AIController: Caracteres:', result.text.length)
      console.log('AIController: Primeros 100 caracteres:', result.text.substring(0, 100))
      
      return result
    } catch (error) {
      console.error('AIController: Error completo:', error)
      console.error('AIController: Error stack:', error.stack)
      
      // Intentar proporcionar información más específica del error
      let errorMessage = 'Error extracting text from PDF'
      if (error.message.includes('Could not load PDF.js')) {
        errorMessage = 'No se pudo cargar la librería PDF.js'
      } else if (error.message.includes('Invalid PDF')) {
        errorMessage = 'El archivo PDF está corrupto o no es válido'
      } else if (error.message.includes('Password required')) {
        errorMessage = 'El PDF está protegido por contraseña'
      } else {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  },

  // Método para generar preguntas usando Gemini AI
  generateQuestions: async config => {
    if (!apiKey) {
      throw new Error('Gemini API key is not set.')
    }

    try {
      console.log('AIController: Iniciando generación de preguntas con Gemini')
      console.log('AIController: Configuración:', config)

      // Construir el prompt para Gemini con instrucciones específicas
      const prompt = `
Eres un profesor experto creando preguntas de examen. Analiza el siguiente texto y genera exactamente ${config.multipleChoice} preguntas de opción múltiple y ${config.trueFalse} preguntas de verdadero/falso.

TEXTO A ANALIZAR:
"${config.text}"

INSTRUCCIONES:
1. Lee y comprende completamente el texto
2. Identifica la materia/categoría principal del contenido (ej: Biología, Historia, Matemáticas, etc.)
3. Genera preguntas que evalúen comprensión, análisis y conocimiento del texto
4. Para preguntas de opción múltiple: incluye 2 a 4 opciones, solo una correcta
5. Para preguntas verdadero/falso: asegúrate que sean claras y verificables

FORMATO DE RESPUESTA (JSON estricto):
{
  "questions": [
    {
      "type": "multiple_choice",
      "text": "Pregunta clara y específica sobre el contenido",
      "category": "Nombre de la materia/categoría identificada",
      "options": [
        {"text": "Opción A (correcta)", "is_correct": true},
        {"text": "Opción B (incorrecta)", "is_correct": false},
        {"text": "Opción C (incorrecta)", "is_correct": false},
        {"text": "Opción D (incorrecta)", "is_correct": false}
      ],
      "correctAnswer": 0,
      "explanation": "Breve explicación de por qué esta respuesta es correcta"
    },
    {
      "type": "true_false",
      "text": "Afirmación clara que se puede evaluar como verdadera o falsa",
      "category": "Nombre de la materia/categoría identificada",
      "correctAnswer": true,
      "explanation": "Breve explicación de por qué esta afirmación es verdadera o falsa"
    }
  ]
}

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional
- Todas las preguntas deben estar basadas en el contenido del texto
- La categoría debe ser consistente y apropiada para el contenido
- Las preguntas deben ser educativas y de calidad académica
- Asegúrate de generar exactamente ${config.multipleChoice} preguntas de opción múltiple y ${config.trueFalse} preguntas de verdadero/falso
      `.trim()

      console.log('AIController: Enviando prompt a Gemini API...')

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
      }

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
      console.log('AIController: Respuesta recibida de Gemini API')
      
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      
      if (!generatedText) {
        throw new Error('No se pudo generar el contenido desde la API')
      }

      console.log('AIController: Texto generado:', generatedText.substring(0, 200) + '...')

      try {
        // Limpiar el texto antes de parsearlo (remover posibles caracteres extra)
        const cleanedText = generatedText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsedQuestions = JSON.parse(cleanedText)
        
        if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
          throw new Error('El formato de respuesta de la API no es válido')
        }

        console.log(
          'AIController: Preguntas generadas exitosamente:',
          parsedQuestions.questions.length
        )
        return parsedQuestions
      } catch (parseError) {
        console.error('AIController: Error parseando JSON:', parseError)
        console.error('AIController: Texto a parsear:', generatedText)
        throw new Error('Error al procesar las preguntas generadas por la API')
      }
    } catch (error) {
      console.error('AIController: Error generando preguntas:', error)
      throw new Error(`Error generating questions: ${error.message}`)
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
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
