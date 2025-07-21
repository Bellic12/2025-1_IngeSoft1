"use client"

import { useState, useRef } from "react"
import {
  Upload,
  FileText,
  Settings,
  Wand2,
  Edit3,
  Save,
  X,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Brain,
  Sparkles,
  Edit,
} from "lucide-react"

const AIQuestionGenerator = ({ isOpen, onClose, onQuestionsGenerated }) => {
  const [currentStep, setCurrentStep] = useState(2) // Saltamos directo al paso 2
  const [pdfFile, setPdfFile] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfError, setPdfError] = useState("")
  const [pdfPages, setPdfPages] = useState(0)
  
  // Texto de prueba para testing de la API
  const testText = `
    La fotosíntesis es el proceso biológico fundamental mediante el cual las plantas, algas y algunas bacterias convierten la energía lumínica en energía química. Este proceso ocurre principalmente en los cloroplastos de las células vegetales, específicamente en una estructura llamada tilacoides donde se encuentra la clorofila.

    El proceso de fotosíntesis se puede dividir en dos fases principales: las reacciones lumínicas (fase fotoquímica) y las reacciones oscuras o ciclo de Calvin (fase bioquímica).

    En las reacciones lumínicas, la luz solar es capturada por la clorofila y otros pigmentos fotosintéticos. Esta energía se utiliza para dividir las moléculas de agua (H2O) en hidrógeno y oxígeno. El oxígeno se libera como subproducto hacia la atmósfera, mientras que el hidrógeno se combina con el dióxido de carbono (CO2) del aire para formar glucosa.

    La ecuación general de la fotosíntesis es: 6CO2 + 6H2O + energía lumínica → C6H12O6 + 6O2

    Este proceso es esencial para la vida en la Tierra, ya que produce el oxígeno que respiramos y forma la base de la cadena alimentaria. Sin la fotosíntesis, no existiría vida como la conocemos.

    Los factores que afectan la fotosíntesis incluyen la intensidad de la luz, la temperatura, la concentración de CO2 y la disponibilidad de agua. Las plantas han desarrollado diferentes estrategias para optimizar este proceso según su ambiente.
  `
  const [questionConfig, setQuestionConfig] = useState({
    multipleChoice: 5,
    trueFalse: 3,
  })
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const fileInputRef = useRef(null)

  const steps = [
    { id: 1, title: "Subir PDF", icon: Upload },
    { id: 2, title: "Configurar", icon: Settings },
    { id: 3, title: "Generar", icon: Wand2 },
    { id: 4, title: "Editar", icon: Edit3 },
    { id: 5, title: "Guardar", icon: Save },
  ]

  // Categorías que la IA puede asignar
  const aiCategories = [
    "Matemáticas",
    "Historia",
    "Ciencias",
    "Literatura",
    "Geografía",
    "Física",
    "Química",
    "Biología",
  ]

  // Extracción real de texto del PDF con validaciones
  const handleFileUpload = async event => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      // Validar tamaño del archivo (máximo 10 MB)
      const maxSize = 10 * 1024 * 1024 // 10 MB en bytes
      if (file.size > maxSize) {
        setPdfError('El archivo PDF es demasiado grande. El tamaño máximo permitido es 10 MB.')
        return
      }

      setPdfFile(file)
      setPdfError('')
      setIsProcessing(true)

      try {
        // Verificar si window.aiAPI existe
        if (!window.aiAPI) {
          throw new Error('window.aiAPI no está disponible. Verifique que la aplicación esté ejecutándose en Electron.')
        }
        
        if (!window.aiAPI.extractPdfText) {
          throw new Error('Método extractPdfText no disponible en window.aiAPI.')
        }

        console.log('Iniciando procesamiento del PDF:', file.name)
        console.log('window.aiAPI disponible:', !!window.aiAPI)
        
        // Convertir archivo a ArrayBuffer
        const buffer = await file.arrayBuffer()
        console.log('Buffer creado, tamaño:', buffer.byteLength, 'bytes')

        // Llamar al IPC handler para extraer texto y obtener información del PDF
        console.log('Llamando a extractPdfText...')
        const result = await window.aiAPI.extractPdfText(buffer)
        console.log('Resultado recibido:', result)
        
        // Verificar que el resultado tenga la estructura esperada
        if (!result || typeof result.text !== 'string' || typeof result.pages !== 'number') {
          throw new Error('Formato de respuesta inválido del servidor')
        }

        // Validar número de páginas (máximo 50 páginas)
        if (result.pages > 50) {
          setPdfError('El archivo PDF tiene demasiadas páginas. El máximo permitido es 50 páginas.')
          setPdfFile(null)
          return
        }

        // Validar que se extrajo texto
        if (!result.text || result.text.trim().length === 0) {
          setPdfError('No se pudo extraer texto del PDF. El archivo puede estar vacío o ser solo imágenes.')
          setPdfFile(null)
          return
        }

        setPdfPages(result.pages)
        setExtractedText(result.text)
        console.log('Procesamiento exitoso. Páginas:', result.pages, 'Caracteres:', result.text.length)
        
      } catch (error) {
        console.error('Error detallado al procesar el PDF:', error)
        
        // Mensajes de error más específicos
        let errorMessage = 'Error al procesar el PDF. '
        
        if (error.message.includes('API de IA no disponible')) {
          errorMessage += 'La aplicación no está completamente cargada. Intenta recargar la página.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage += 'Error de conexión. Verifica tu conexión a internet.'
        } else if (error.message.includes('PDF.js') || error.message.includes('Invalid PDF')) {
          errorMessage += 'El archivo PDF está corrupto o no es válido.'
        } else if (error.message.includes('Formato de respuesta inválido')) {
          errorMessage += 'Error interno del servidor al procesar el PDF.'
        } else {
          errorMessage += 'Por favor, intenta con otro archivo o contacta al administrador.'
        }
        
        setPdfError(errorMessage)
        setExtractedText('')
        setPdfFile(null)
      } finally {
        setIsProcessing(false)
      }
    } else if (file) {
      setPdfError('Por favor selecciona un archivo PDF válido.')
    }
  }

  // Generar preguntas usando la API de Gemini con el texto de prueba
  const generateQuestions = async () => {
    setIsGenerating(true)
    
    try {
      console.log('Iniciando generación de preguntas con IA...')
      
      // Verificar que la API esté disponible
      if (!window.aiAPI || !window.aiAPI.generateQuestions) {
        throw new Error('API de IA no disponible')
      }
      
      // Preparar la configuración
      const config = {
        text: testText, // Usar el texto de prueba
        multipleChoice: questionConfig.multipleChoice,
        trueFalse: questionConfig.trueFalse,
      }
      
      console.log('Configuración enviada:', config)
      
      // Llamar a la API para generar preguntas
      const result = await window.aiAPI.generateQuestions(config)
      console.log('Respuesta de la API:', result)
      
      if (!result || !result.questions || !Array.isArray(result.questions)) {
        throw new Error('Respuesta inválida de la API de IA')
      }
      
      // Procesar las preguntas generadas
      const processedQuestions = result.questions.map((q, index) => ({
        id: `ai_${index}`,
        type: q.type,
        text: q.text,
        options: q.options || [], // Para preguntas de opción múltiple
        correctAnswer: q.correctAnswer,
        category: q.category || 'General', // Categoría detectada por la IA
      }))
      
      setGeneratedQuestions(processedQuestions)
      setSelectedQuestions(processedQuestions.map((q) => q.id))
      setCurrentStep(4) // Ir directo al paso de edición
      
    } catch (error) {
      console.error('Error generando preguntas:', error)
      
      let errorMessage = 'Error al generar preguntas con IA. '
      if (error.message.includes('API de IA no disponible')) {
        errorMessage += 'La funcionalidad de IA no está disponible en este momento.'
      } else if (error.message.includes('API key')) {
        errorMessage += 'La clave de API de Gemini no está configurada.'
      } else {
        errorMessage += 'Por favor, intenta nuevamente.'
      }
      
      // Mostrar error en la interfaz (puedes agregar un estado de error si no existe)
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Añadir nueva opción
  const addOption = (questionId) => {
    setEditingQuestion((prev) => ({
      ...prev,
      options: [...prev.options, "Nueva opción"],
    }))
  }

  // Eliminar opción
  const removeOption = (questionId, optionIndex) => {
    if (editingQuestion.options.length <= 2) {
      return
    }
    setEditingQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== optionIndex),
      correctAnswer:
        prev.correctAnswer === optionIndex
          ? 0
          : prev.correctAnswer > optionIndex
            ? prev.correctAnswer - 1
            : prev.correctAnswer,
    }))
  }

  // Eliminar pregunta
  const removeQuestion = (questionId) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== questionId))
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId))
  }

  // Seleccionar/deseleccionar pregunta
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  // Abrir modal de edición
  const openEditModal = (question) => {
    setEditingQuestion({ ...question })
    setShowEditModal(true)
  }

  // Guardar cambios de edición
  const saveEditedQuestion = () => {
    if (editingQuestion) {
      setGeneratedQuestions((prev) => prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q)))
      setShowEditModal(false)
      setEditingQuestion(null)
    }
  }

  // Guardar preguntas seleccionadas
  const saveQuestions = async () => {
    setIsSaving(true)

    const questionsToSave = generatedQuestions.filter((q) => selectedQuestions.includes(q.id))

    try {
      // Guardar cada pregunta en la base de datos
      const savedQuestions = []
      
      for (const question of questionsToSave) {
        try {
          // Preparar datos de la pregunta
          const questionData = {
            text: question.text,
            type: question.type,
            category_name: question.category || 'General', // Siempre enviar nombre de categoría
            source: 'ai', // Marcar como generada por IA
          }

          // Crear la pregunta
          const createdQuestion = await window.questionAPI.create(questionData)
          
          // Crear opciones para la pregunta
          if (question.type === 'multiple_choice' && question.options) {
            for (let i = 0; i < question.options.length; i++) {
              const optionData = {
                question_id: createdQuestion.question_id,
                text: question.options[i].text || question.options[i],
                is_correct:
                  question.options[i].is_correct !== undefined
                    ? question.options[i].is_correct
                    : i === question.correctAnswer,
              }
              await window.optionAPI.create(optionData)
            }
          } else if (question.type === 'true_false') {
            // Crear opciones para verdadero/falso
            await window.optionAPI.create({
              question_id: createdQuestion.question_id,
              text: 'Verdadero',
              is_correct: question.correctAnswer === true,
            })
            await window.optionAPI.create({
              question_id: createdQuestion.question_id,
              text: 'Falso',
              is_correct: question.correctAnswer === false,
            })
          }

          savedQuestions.push(createdQuestion)
          
        } catch (questionError) {
          console.error('Error guardando pregunta individual:', questionError)
          // Continuar con las demás preguntas
        }
      }

      console.log('Preguntas guardadas exitosamente:', savedQuestions.length)
      
      // Llamar callback con las preguntas guardadas
      onQuestionsGenerated(savedQuestions)
      handleClose()
      
    } catch (error) {
      console.error('Error guardando preguntas:', error)
      alert('Error al guardar las preguntas en la base de datos. Por favor, intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setPdfFile(null)
    setExtractedText('')
    setPdfError('')
    setPdfPages(0)
    setGeneratedQuestions([])
    setSelectedQuestions([])
    setQuestionConfig({
      multipleChoice: 5,
      trueFalse: 3,
    })
    setShowEditModal(false)
    setEditingQuestion(null)
    onClose()
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-6xl h-5/6 max-h-none">
          {/* Header con colores azul oscuro/morado */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Generador de Preguntas con IA</h2>
                  <p className="opacity-80">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-circle text-white hover:bg-blue hover:bg-opacity-20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <ul className="steps steps-horizontal w-full">
                {steps.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <li key={step.id} className={`step ${isCompleted || isActive ? "step-primary" : ""}`}>
                      <div className="flex items-center gap-2">
                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        <span className="hidden sm:inline">{step.title}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {/* Step 1: Mostrar texto de prueba */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Texto de Prueba para IA</h3>
                  <p className="text-base-content/70">
                    Usando el siguiente texto para generar preguntas con Gemini AI
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Texto de Estudio - Fotosíntesis
                      </h4>
                      <div className="badge badge-success">
                        {testText.length} caracteres
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-base-content/80">
                        {testText}
                      </pre>
                    </div>
                    <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                      <div className="flex items-center gap-2 text-info">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Listo para continuar</span>
                      </div>
                      <p className="text-sm text-base-content/70 mt-1">
                        Este texto será usado para generar preguntas inteligentes usando Gemini AI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Configure Questions - Sin dificultad ni categoría */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Configurar Preguntas</h3>
                  <p className="text-base-content/70">Especifica qué tipos de preguntas deseas generar</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Tipos de preguntas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="card bg-info/10 border border-info/20">
                      <div className="card-body">
                        <h4 className="card-title text-info flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Opción Múltiple
                        </h4>
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() =>
                              setQuestionConfig((prev) => ({
                                ...prev,
                                multipleChoice: Math.max(0, prev.multipleChoice - 1),
                              }))
                            }
                            className="btn btn-circle btn-sm btn-outline"
                            disabled={questionConfig.multipleChoice <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-info">{questionConfig.multipleChoice}</div>
                            <div className="text-sm text-base-content/70">preguntas</div>
                          </div>
                          <button
                            onClick={() =>
                              setQuestionConfig((prev) => ({
                                ...prev,
                                multipleChoice: prev.multipleChoice + 1,
                              }))
                            }
                            className="btn btn-circle btn-sm btn-outline"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-success/10 border border-success/20">
                      <div className="card-body">
                        <h4 className="card-title text-success flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Verdadero/Falso
                        </h4>
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() =>
                              setQuestionConfig((prev) => ({
                                ...prev,
                                trueFalse: Math.max(0, prev.trueFalse - 1),
                              }))
                            }
                            className="btn btn-circle btn-sm btn-outline"
                            disabled={questionConfig.trueFalse <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-success">{questionConfig.trueFalse}</div>
                            <div className="text-sm text-base-content/70">preguntas</div>
                          </div>
                          <button
                            onClick={() =>
                              setQuestionConfig((prev) => ({
                                ...prev,
                                trueFalse: prev.trueFalse + 1,
                              }))
                            }
                            className="btn btn-circle btn-sm btn-outline"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="alert alert-info">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <h4 className="font-medium">Resumen de configuración</h4>
                      <div className="text-sm">
                        Se generarán <strong>{questionConfig.multipleChoice + questionConfig.trueFalse}</strong>{" "}
                        preguntas ({questionConfig.multipleChoice} de opción múltiple, {questionConfig.trueFalse} de
                        verdadero/falso). La IA asignará automáticamente las categorías y dificultades apropiadas.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Generate Questions - Con barra de progreso animada */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Generar Preguntas</h3>
                  <p className="text-base-content/70">La IA está procesando el contenido para crear las preguntas</p>
                </div>

                <div className="max-w-md mx-auto">
                  {!isGenerating ? (
                    <div className="text-center space-y-6">
                      <div className="avatar">
                        <div className="w-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Wand2 className="w-16 h-16 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg mb-4">¿Listo para generar las preguntas?</p>
                        <button onClick={generateQuestions} className="btn btn-primary btn-lg">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generar con IA
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="avatar">
                        <div className="w-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Generando preguntas...</p>
                        <p className="text-sm text-base-content/70">
                          La IA está analizando el contenido y creando preguntas personalizadas
                        </p>
                      </div>
                      {/* Barra de progreso animada */}
                      <div className="w-full">
                        <progress className="progress progress-primary w-full animate-pulse"></progress>
                        <div className="flex justify-between text-xs text-base-content/70 mt-1">
                          <span>Analizando contenido...</span>
                          <span>Generando preguntas...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Edit Questions - Estilo de las imágenes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Preguntas Generadas</h3>
                    <p className="text-base-content/70">Revisa y edita las preguntas antes de guardarlas</p>
                  </div>
                  <div className="badge badge-info">
                    {selectedQuestions.length} de {generatedQuestions.length} seleccionadas
                  </div>
                </div>

                <div className="space-y-4">
                  {generatedQuestions.map((question) => {
                    const isSelected = selectedQuestions.includes(question.id)
                    return (
                      <div
                        key={question.id}
                        className={`bg-slate-800 text-white p-4 rounded-lg ${isSelected ? "ring-2 ring-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mt-1"
                              checked={isSelected}
                              onChange={() => toggleQuestionSelection(question.id)}
                            />
                            <div className="flex-1">
                              <h4 className="text-lg font-medium mb-3">{question.text}</h4>
                              
                              {/* Mostrar opciones de la pregunta */}
                              {question.type === "multiple_choice" && question.options && question.options.length > 0 && (
                                <div className="mb-3">
                                  <div className="grid grid-cols-1 gap-1 text-sm">
                                    {question.options.map((option, index) => {
                                      const optionText = typeof option === 'object' ? option.text : option
                                      const isCorrect = typeof option === 'object' 
                                        ? option.is_correct 
                                        : index === question.correctAnswer
                                      
                                      return (
                                        <div key={index} className={`px-2 py-1 rounded ${isCorrect ? 'bg-green-600' : 'bg-slate-700'}`}>
                                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {optionText}
                                          {isCorrect && <span className="ml-2 text-green-200">✓</span>}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {question.type === "true_false" && (
                                <div className="mb-3">
                                  <div className="grid grid-cols-2 gap-1 text-sm">
                                    <div className={`px-2 py-1 rounded ${question.correctAnswer === true ? 'bg-green-600' : 'bg-slate-700'}`}>
                                      <span className="font-medium">Verdadero</span>
                                      {question.correctAnswer === true && <span className="ml-2 text-green-200">✓</span>}
                                    </div>
                                    <div className={`px-2 py-1 rounded ${question.correctAnswer === false ? 'bg-green-600' : 'bg-slate-700'}`}>
                                      <span className="font-medium">Falso</span>
                                      {question.correctAnswer === false && <span className="ml-2 text-green-200">✓</span>}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2 mb-3">
                                <span className="badge bg-blue-500 text-white">
                                  {question.type === "multiple_choice" ? "Selección múltiple" : "Verdadero/Falso"}
                                </span>
                                <span className="badge badge-outline text-white border-gray-400">
                                  {question.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(question)}
                              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeQuestion(question.id)}
                              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {generatedQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-base-content/40 mx-auto mb-4" />
                    <p className="text-base-content/70">No hay preguntas generadas</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Save Questions */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Guardar Preguntas</h3>
                  <p className="text-base-content/70">
                    Las preguntas seleccionadas se guardarán en tu banco de preguntas
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  {!isSaving ? (
                    <div className="text-center space-y-6">
                      <div className="avatar">
                        <div className="w-32 rounded-full bg-gradient-to-br from-success/20 to-info/20 flex items-center justify-center">
                          <Save className="w-16 h-16 text-success" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg mb-2">¿Guardar {selectedQuestions.length} preguntas?</p>
                        <p className="text-sm text-base-content/70 mb-4">
                          Las preguntas se añadirán a tu banco de preguntas y estarán disponibles para crear exámenes.
                        </p>
                        <button
                          onClick={saveQuestions}
                          className="btn btn-success btn-lg"
                          disabled={selectedQuestions.length === 0}
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Guardar Preguntas
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="avatar">
                        <div className="w-32 rounded-full bg-gradient-to-br from-success/20 to-info/20 flex items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-success"></span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Guardando preguntas...</p>
                        <p className="text-sm text-base-content/70">Añadiendo las preguntas a tu banco de preguntas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-action">
            <button
              onClick={prevStep}
              className="btn btn-outline"
              disabled={currentStep === 1 || isProcessing || isGenerating || isSaving}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>

            <div className="flex-1 text-center">
              <span className="text-sm text-base-content/70">
                Paso {currentStep} de {steps.length}
              </span>
            </div>

            <button
              onClick={nextStep}
              className="btn btn-primary"
              disabled={
                currentStep === 5 ||
                (currentStep === 1 && !testText) || // El texto de prueba siempre está disponible
                (currentStep === 2 && questionConfig.multipleChoice + questionConfig.trueFalse === 0) ||
                (currentStep === 3 && generatedQuestions.length === 0) ||
                isProcessing ||
                isGenerating ||
                isSaving
              }
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edición - Sin campo de categoría */}
      {showEditModal && editingQuestion && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-800 text-white max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Editar pregunta</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-circle text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Campo de pregunta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pregunta</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-slate-700 text-white border-slate-600"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                />
              </div>

              {/* Solo tipo de pregunta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de pregunta</label>
                <select
                  className="select select-bordered w-full bg-slate-700 text-white border-slate-600"
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
                >
                  <option value="multiple_choice">Opción múltiple</option>
                  <option value="true_false">Verdadero/Falso</option>
                </select>
              </div>

              {/* Opciones (solo para preguntas de opción múltiple) */}
              {editingQuestion.type === "multiple_choice" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Opciones</label>
                  <div className="space-y-3">
                    {editingQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          className="radio radio-primary"
                          checked={editingQuestion.correctAnswer === index}
                          onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                        />
                        <input
                          type="text"
                          className="input input-bordered flex-1 bg-slate-700 text-white border-slate-600"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options]
                            newOptions[index] = e.target.value
                            setEditingQuestion({ ...editingQuestion, options: newOptions })
                          }}
                        />
                        <button
                          onClick={() => removeOption(editingQuestion.id, index)}
                          className="btn btn-ghost btn-circle btn-sm text-red-400 hover:bg-red-900"
                          disabled={editingQuestion.options.length <= 2}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addOption(editingQuestion.id)}
                    className="btn btn-outline btn-primary w-full mt-3"
                  >
                    Añadir opción
                  </button>
                </div>
              )}

              {/* Respuesta para verdadero/falso */}
              {editingQuestion.type === "true_false" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Respuesta correcta</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_answer"
                        className="radio radio-primary"
                        checked={editingQuestion.correctAnswer === true}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: true })}
                      />
                      <span>Verdadero</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_answer"
                        className="radio radio-primary"
                        checked={editingQuestion.correctAnswer === false}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: false })}
                      />
                      <span>Falso</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                onClick={saveEditedQuestion}
                className="btn bg-pink-600 hover:bg-pink-700 text-white border-none w-full"
              >
                Actualizar pregunta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIQuestionGenerator
