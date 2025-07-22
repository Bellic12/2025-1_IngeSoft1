'use client'

import { useState, useRef } from 'react'
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
  CheckCircle,
} from 'lucide-react'
import pdfToText from 'react-pdftotext'
import EditAIQuestion from '../../questions/forms/EditAIQuestion'
import { toast } from 'react-toastify'

const AIQuestionGenerator = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
  examId = null,
  examData = null,
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [pdfFile, setPdfFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [, setPdfPages] = useState(0)
  const [wordLimitError, setWordLimitError] = useState('')

  const [questionConfig, setQuestionConfig] = useState({
    multipleChoice: 5,
    trueFalse: 3,
  })
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const fileInputRef = useRef(null)

  const steps = [
    { id: 1, title: 'Subir PDF', icon: Upload },
    { id: 2, title: 'Configurar', icon: Settings },
    { id: 3, title: 'Generar', icon: Wand2 },
    { id: 4, title: 'Editar', icon: Edit3 },
  ]

  // Generar preguntas usando la API de Gemini con el texto de prueba
  const generateQuestions = async () => {
    setIsGenerating(true)

    try {
      console.log('Iniciando generación de preguntas con IA...')

      // Preparar la configuración
      const config = {
        text: extractedText, // Usar el texto extraído del PDF
        multipleChoice: questionConfig.multipleChoice,
        trueFalse: questionConfig.trueFalse,
        // Agregar información del examen si está disponible
        ...(examData && {
          examContext: {
            name: examData.name,
            description: examData.description,
          },
        }),
      }

      console.log('Configuración enviada:', config)

      // Llamar a la API para generar preguntas
      const result = await window.aiAPI.generateQuestions(config)
      console.log('Respuesta de la API:', result)

      if (!result || !result.questions || !Array.isArray(result.questions)) {
        throw new Error('Respuesta inválida de la API de IA')
      }

      // Procesar las preguntas generadas
      const processedQuestions = result.questions.map((q, index) => {
        // Generar un category_id único por nombre de categoría (simple hash)
        const catName = q.category || 'General'
        let catId = 0
        for (let i = 0; i < catName.length; i++) {
          catId += catName.charCodeAt(i) * (i + 1)
        }
        return {
          id: `ai_${index}`,
          type: q.type,
          text: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          category: catName,
          category_id: catId,
        }
      })

      setGeneratedQuestions(processedQuestions)
      setSelectedQuestions(processedQuestions.map(q => q.id))
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

  // Eliminar pregunta
  const removeQuestion = questionId => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
    setSelectedQuestions(prev => prev.filter(id => id !== questionId))
  }

  // Seleccionar/deseleccionar pregunta
  const toggleQuestionSelection = questionId => {
    setSelectedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    )
  }

  // Guardar preguntas seleccionadas
  const saveQuestions = async () => {
    setIsSaving(true)
    const newValidationErrors = []
    const questionsToSave = generatedQuestions.filter(q => selectedQuestions.includes(q.id))
    const successfullyProcessed = []
    const createdQuestionIds = [] // Para almacenar los IDs de las preguntas creadas

    try {
      for (const question of questionsToSave) {
        try {
          let categoryId = null

          // Verificar si la pregunta tiene categoría
          if (question.category && question.category !== 'General') {
            // Verificar si la categoría ya existe en la base de datos
            const categoryExists = await window.categoryAPI.nameExists(question.category)

            if (!categoryExists) {
              // Crear la categoría si no existe
              try {
                const newCategory = await window.categoryAPI.create({ name: question.category })
                categoryId = newCategory.category_id
                console.log(`Categoría creada: ${question.category} con ID: ${categoryId}`)
              } catch (categoryError) {
                console.error('Error creando categoría:', categoryError)
                // Si falla, continuar sin categoría
                categoryId = null
              }
            } else {
              // Si la categoría existe, obtener su ID
              try {
                const categories = await window.categoryAPI.getAll()
                const existingCategory = categories.find(c => c.name === question.category)
                categoryId = existingCategory ? existingCategory.category_id : null
                console.log(
                  `Categoría existente encontrada: ${question.category} con ID: ${categoryId}`
                )
              } catch (getCategoryError) {
                console.error('Error obteniendo categorías:', getCategoryError)
                categoryId = null
              }
            }
          }

          // Preparar datos para enviar directamente al backend (sin QuestionFactory)
          const questionData = {
            text: question.text,
            type: question.type,
            category_id: categoryId,
            source: 'generated', // Marcar como pregunta generada por IA
            options:
              question.type === 'true_false'
                ? [
                    { text: 'Verdadero', isCorrect: question.correctAnswer === true },
                    { text: 'Falso', isCorrect: question.correctAnswer === false },
                  ]
                : question.options.map((opt, index) => {
                    let isCorrect = false

                    if (typeof opt === 'object') {
                      // Si la opción es un objeto, verificar is_correct o isCorrect
                      isCorrect = Boolean(opt.is_correct || opt.isCorrect)
                    } else {
                      // Si la opción es string, verificar si el índice coincide con correctAnswer
                      isCorrect = index === question.correctAnswer
                    }

                    return {
                      text: typeof opt === 'object' ? opt.text : opt,
                      isCorrect,
                    }
                  }),
          }

          // Crear la pregunta usando validaciones del backend
          const createdQuestion = await window.questionAPI.create(questionData)
          successfullyProcessed.push(question.id)

          // Almacenar el ID de la pregunta creada para asociarla al examen
          if (createdQuestion && createdQuestion.question_id) {
            createdQuestionIds.push(createdQuestion.question_id)
          }
        } catch (questionError) {
          console.error('Error guardando pregunta:', questionError)

          // Extraer mensaje de error del backend
          let errorMessage = questionError.message || 'Error desconocido al guardar la pregunta'

          // Si el error viene del IPC de Electron, extraer solo el mensaje real
          if (errorMessage.includes('Error invoking remote method')) {
            const match = errorMessage.match(/Error: (.+)$/)
            if (match) {
              errorMessage = match[1]
            }
          }

          // Agregar error con identificación de la pregunta
          newValidationErrors.push({
            questionId: question.id,
            questionText: question.text.substring(0, 50) + '...',
            errors: errorMessage.includes(', ')
              ? errorMessage.split(', ').map(err => err.trim())
              : [errorMessage],
          })
        }
      }

      // Si hay un examId y se crearon preguntas exitosamente, asociarlas al examen
      if (examId && createdQuestionIds.length > 0) {
        try {
          await window.examAPI.addQuestions(examId, createdQuestionIds)
          console.log(`${createdQuestionIds.length} preguntas asociadas al examen ${examId}`)
        } catch (examError) {
          console.error('Error asociando preguntas al examen:', examError)
          toast.warning(
            'Las preguntas se crearon pero no pudieron asociarse automáticamente al examen'
          )
        }
      }

      // Remover preguntas exitosamente procesadas de la interfaz
      if (successfullyProcessed.length > 0) {
        setGeneratedQuestions(prev => prev.filter(q => !successfullyProcessed.includes(q.id)))
        setSelectedQuestions(prev => prev.filter(id => !successfullyProcessed.includes(id)))

        const successMessage = examId
          ? `${successfullyProcessed.length} preguntas generadas y agregadas al examen`
          : `${successfullyProcessed.length} preguntas guardadas exitosamente`
        toast.success(successMessage)

        // Llamar callback con las preguntas guardadas
        if (onQuestionsGenerated) {
          onQuestionsGenerated(successfullyProcessed)
        }
      }

      // Actualizar errores de validación
      setValidationErrors(newValidationErrors)

      // Si no quedan preguntas, cerrar modal
      if (generatedQuestions.length === successfullyProcessed.length) {
        handleClose()
      }
    } catch (error) {
      console.error('Error general en saveQuestions:', error)
      toast.error('Error al guardar las preguntas. Por favor, intenta nuevamente.')
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
    setValidationErrors([])
    setQuestionConfig({
      multipleChoice: 5,
      trueFalse: 3,
    })
    onClose()
  }

  const nextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // No limpiar pdfFile ni extractedText al volver atrás
    }
  }

  const handleOnChangeFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setPdfError('')
    setPdfFile(file)
    setExtractedText('') // Limpiar texto si se sube PDF
    setIsProcessing(true)
    try {
      const text = await pdfToText(file)
      const wordCount = text.trim().split(/\s+/).length
      if (wordCount > 10000) {
        setWordLimitError(
          'El PDF tiene más de 10,000 palabras. Por favor, sube un archivo más pequeño.'
        )
        setExtractedText('')
        setPdfFile(null)
      } else {
        setExtractedText(text)
        setPdfPages(file?.numPages || 0)
        setWordLimitError('')
      }
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error)
      setPdfError('Error al procesar el PDF. Asegúrate de que sea un archivo válido.')
    }
    setIsProcessing(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {/* Header con colores azul oscuro/morado */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {examData
                      ? `Generar Preguntas para: ${examData.name}`
                      : 'Generador de Preguntas con IA'}
                  </h2>
                  <p className="opacity-80">
                    {examData && examData.description
                      ? `${examData.description} • Powered by Gemini AI`
                      : 'Powered by Gemini AI'}
                  </p>
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
                {steps.map(step => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <li
                      key={step.id}
                      className={`step ${isCompleted || isActive ? 'step-primary' : ''}`}
                    >
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

          {/* Errores de validación - Esquina superior derecha */}
          {validationErrors.length > 0 && (
            <div className="absolute top-4 right-4 z-10 w-80 max-h-[100vh] overflow-y-auto">
              <div className="bg-error text-error-content rounded-lg shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errores de Validación
                  </h4>
                  <button
                    onClick={() => setValidationErrors([])}
                    className="btn btn-ghost btn-xs text-error-content hover:bg-error-content/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {validationErrors.map((errorGroup, index) => (
                    <div key={index} className="text-xs space-y-1">
                      <div className="font-medium">Pregunta: {errorGroup.questionText}</div>
                      <div className="space-y-1 pl-2">
                        {errorGroup.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="flex items-start gap-1">
                            <span className="text-error-content/80">•</span>
                            <span className="text-error-content/90">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Mostrar texto de prueba */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Texto para IA</h3>
                  <p className="text-base-content/70">
                    Ingresa el texto que deseas usar para generar preguntas, o sube un archivo PDF.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="bg-base-100 border border-base-300 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Texto de estudio</label>
                      <textarea
                        className="textarea textarea-bordered w-full min-h-[120px]"
                        placeholder="Pega aquí el texto para generar preguntas..."
                        value={extractedText}
                        onChange={e => {
                          const value = e.target.value
                          const wordCount = value.trim().split(/\s+/).length
                          if (wordCount > 10000) {
                            setWordLimitError(
                              'El texto tiene más de 10,000 palabras. Por favor, reduce el contenido.'
                            )
                          } else {
                            setWordLimitError('')
                            setExtractedText(value)
                            if (value.length > 0) {
                              setPdfFile(null)
                            }
                          }
                        }}
                        disabled={!!pdfFile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">O subir PDF</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline btn-primary"
                          disabled={extractedText.trim().length > 0 || !!pdfFile}
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '' // Reset para permitir subir el mismo archivo
                              fileInputRef.current.click()
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" /> Subir PDF
                        </button>
                        {pdfFile && (
                          <span className="text-info text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{pdfFile.name}</span>
                            <button
                              className="btn btn-xs btn-ghost text-red-500"
                              onClick={() => {
                                setPdfFile(null)
                                setExtractedText('')
                              }}
                            >
                              <X className="w-4 h-4" /> Quitar
                            </button>
                          </span>
                        )}
                      </div>
                      {wordLimitError && (
                        <div className="mt-2 text-red-500 text-sm">{wordLimitError}</div>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleOnChangeFile}
                        disabled={extractedText.trim().length > 0}
                      />
                      {pdfError && <div className="mt-2 text-red-500 text-sm">{pdfError}</div>}
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
                  <p className="text-base-content/70">
                    Especifica qué tipos de preguntas deseas generar
                  </p>
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
                              setQuestionConfig(prev => ({
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
                            <div className="text-3xl font-bold text-info">
                              {questionConfig.multipleChoice}
                            </div>
                            <div className="text-sm text-base-content/70">preguntas</div>
                          </div>
                          <button
                            onClick={() =>
                              setQuestionConfig(prev => ({
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
                              setQuestionConfig(prev => ({
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
                            <div className="text-3xl font-bold text-success">
                              {questionConfig.trueFalse}
                            </div>
                            <div className="text-sm text-base-content/70">preguntas</div>
                          </div>
                          <button
                            onClick={() =>
                              setQuestionConfig(prev => ({
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
                        Se generarán{' '}
                        <strong>{questionConfig.multipleChoice + questionConfig.trueFalse}</strong>{' '}
                        preguntas ({questionConfig.multipleChoice} de opción múltiple,{' '}
                        {questionConfig.trueFalse} de verdadero/falso). La IA asignará
                        automáticamente las categorías y dificultades apropiadas.
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
                  <p className="text-base-content/70">
                    La IA está procesando el contenido para crear las preguntas
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Wand2 className="w-16 h-16 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg mb-4">
                        {isGenerating
                          ? 'Generando preguntas...'
                          : '¿Listo para generar las preguntas?'}
                      </p>
                      <button
                        onClick={generateQuestions}
                        className="btn btn-primary btn-lg"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Generando con IA
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generar con IA
                          </>
                        )}
                      </button>
                      {isGenerating && (
                        <p className="text-sm text-base-content/70 mt-4">
                          La IA está analizando el contenido y creando preguntas personalizadas
                        </p>
                      )}
                    </div>
                    {/* Barra de progreso animada solo cuando está generando */}
                    {isGenerating && (
                      <div className="w-full">
                        <progress className="progress progress-primary w-full animate-pulse"></progress>
                        <div className="flex justify-between text-xs text-base-content/70 mt-1">
                          <span>Analizando contenido...</span>
                          <span>Generando preguntas...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Edit Questions - Estilo de las imágenes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Preguntas Generadas</h3>
                    <p className="text-base-content/70">
                      Revisa y edita las preguntas antes de guardarlas
                    </p>
                  </div>
                  <div className="badge badge-info">
                    {selectedQuestions.length} de {generatedQuestions.length} seleccionadas
                  </div>
                </div>

                <div className="space-y-6">
                  {generatedQuestions.map((question, index) => {
                    const isSelected = selectedQuestions.includes(question.id)
                    return (
                      <div
                        key={question.id}
                        className={`bg-base-100 rounded-lg shadow-lg p-6 border-2 ${isSelected ? 'border-primary' : 'border-base-300'}`}
                      >
                        {/* Header de la pregunta */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary"
                              checked={isSelected}
                              onChange={() => toggleQuestionSelection(question.id)}
                            />
                            <span className="badge badge-outline badge-lg">
                              Pregunta {index + 1}
                            </span>
                          </div>
                          <div className="text-right">
                            <EditAIQuestion
                              question={question}
                              onSave={updatedQuestion => {
                                setGeneratedQuestions(prev =>
                                  prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
                                )
                              }}
                              onCancel={() => {}}
                              categories={Array.from(
                                new Map(
                                  generatedQuestions
                                    .filter(q => q.category && q.category_id)
                                    .map(q => [
                                      q.category_id,
                                      { category_id: q.category_id, name: q.category },
                                    ])
                                ).values()
                              )}
                            />
                            <button
                              onClick={() => removeQuestion(question.id)}
                              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">{question.text}</h3>

                        <div className="flex gap-2 mb-4">
                          <span className="badge bg-purple-600 text-white">
                            {question.category || 'Sin categoría'}
                          </span>
                          <span
                            className={`badge ${question.type === 'multiple_choice' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}
                          >
                            {question.type === 'multiple_choice'
                              ? 'Selección múltiple'
                              : 'Verdadero/Falso'}
                          </span>
                        </div>

                        {/* Opciones de respuesta */}
                        <div className="space-y-3">
                          {question.type === 'multiple_choice' &&
                            question.options &&
                            question.options.length > 0 &&
                            question.options.map((option, idx) => {
                              // Si la opción es un objeto, usar option.text, si es string, usar option
                              const optionText = typeof option === 'object' ? option.text : option
                              const isCorrect =
                                typeof option === 'object'
                                  ? option.is_correct
                                  : idx === question.correctAnswer
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center p-4 rounded-lg border-2 ${isCorrect ? 'bg-success/20 border-success text-white' : 'bg-base-200 border-base-300 text-base-content'}`}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                                    <span className="font-medium">{optionText}</span>
                                  </div>
                                  {isCorrect && (
                                    <span className="badge badge-success badge-sm">Correcta</span>
                                  )}
                                </div>
                              )
                            })}
                          {question.type === 'true_false' && (
                            <>
                              <div
                                className={`flex items-center p-4 rounded-lg border-2 ${question.correctAnswer === true ? 'bg-success/20 border-success text-white' : 'bg-base-200 border-base-300 text-base-content'}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {question.correctAnswer === true && (
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  )}
                                  <span className="font-medium">Verdadero</span>
                                </div>
                                {question.correctAnswer === true && (
                                  <span className="badge badge-success badge-sm">Correcta</span>
                                )}
                              </div>
                              <div
                                className={`flex items-center p-4 rounded-lg border-2 ${question.correctAnswer === false ? 'bg-success/20 border-success text-white' : 'bg-base-200 border-base-300 text-base-content'}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {question.correctAnswer === false && (
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  )}
                                  <span className="font-medium">Falso</span>
                                </div>
                                {question.correctAnswer === false && (
                                  <span className="badge badge-success badge-sm">Correcta</span>
                                )}
                              </div>
                            </>
                          )}
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

                {/* Botón de guardar preguntas */}
                {generatedQuestions.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={saveQuestions}
                      className="btn btn-success btn-lg"
                      disabled={selectedQuestions.length === 0 || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Guardando Preguntas
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Guardar {selectedQuestions.length} Preguntas
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-base-300 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                className="btn btn-outline"
                disabled={currentStep === 1 || isProcessing || isGenerating || isSaving}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>

              <span className="text-sm text-base-content/70">
                Paso {currentStep} de {steps.length}
              </span>

              <button
                onClick={nextStep}
                className="btn btn-primary"
                disabled={
                  currentStep === 4 ||
                  (currentStep === 1 && !(extractedText.trim().length > 0 || pdfFile)) ||
                  (currentStep === 2 &&
                    questionConfig.multipleChoice + questionConfig.trueFalse === 0) ||
                  (currentStep === 3 && generatedQuestions.length === 0) ||
                  isProcessing ||
                  isGenerating ||
                  isSaving
                }
              >
                {isProcessing && currentStep === 1 && pdfFile ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    Procesando PDF...
                  </span>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AIQuestionGenerator
