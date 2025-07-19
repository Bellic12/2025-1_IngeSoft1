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
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Brain,
  Sparkles,
} from "lucide-react"

const AIQuestionGenerator = ({ isOpen, onClose, onQuestionsGenerated }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [pdfFile, setPdfFile] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [questionConfig, setQuestionConfig] = useState({
    multipleChoice: 5,
    trueFalse: 3,
    category: 'General', // Removemos difficulty ya que no es un atributo en la BD
  })
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  const steps = [
    { id: 1, title: "Subir PDF", icon: Upload },
    { id: 2, title: "Configurar", icon: Settings },
    { id: 3, title: "Generar", icon: Wand2 },
    { id: 4, title: "Editar", icon: Edit3 },
    { id: 5, title: "Guardar", icon: Save },
  ]

  const categories = ["General", "Matemáticas", "Historia", "Ciencias", "Literatura", "Geografía"]

  // Simular extracción de texto del PDF
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setIsProcessing(true)

      // Simular procesamiento del PDF
      setTimeout(() => {
        setExtractedText(`
          Texto extraído del PDF: ${file.name}
          
          Este es un ejemplo de texto extraído de un documento PDF. En una implementación real,
          aquí estaría el contenido completo del documento que será procesado por la IA para
          generar preguntas relevantes basadas en el contenido.
          
          El texto puede incluir conceptos, definiciones, fechas importantes, fórmulas,
          y cualquier otro tipo de información que pueda ser convertida en preguntas
          de evaluación de diferentes tipos y niveles de dificultad.
        `)
        setIsProcessing(false)
      }, 2000)
    }
  }

  // Generar preguntas usando la API de Gemini
  const generateQuestions = async () => {
    setIsGenerating(true)
    try {
      // Llamar al controlador a través del IPC
      const questions = await window.aiAPI.generateQuestionsFromPDF({
        pdfBuffer: await pdfFile.arrayBuffer(),
        config: questionConfig
      })

      // Asignar IDs únicos a las preguntas generadas
      const questionsWithIds = questions.map((q, index) => ({
        ...q,
        id: q.type === 'multiple_choice' ? `mc_${index + 1}` : `tf_${index + 1}`
      }))

      setGeneratedQuestions(questionsWithIds)
      setSelectedQuestions(questionsWithIds.map(q => q.id))
      setCurrentStep(4)
    } catch (error) {
      console.error('Error al generar preguntas:', error)
      // Aquí podrías mostrar un toast o alguna notificación de error
    } finally {
      setIsGenerating(false)
    }
  }

  // Editar pregunta
  const updateQuestion = (questionId, field, value) => {
    setGeneratedQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)))
  }

  // Editar opción de pregunta múltiple
  const updateQuestionOption = (questionId, optionIndex, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q,
      ),
    )
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

  // Guardar preguntas seleccionadas
  const saveQuestions = async () => {
    setIsSaving(true)

    const questionsToSave = generatedQuestions.filter((q) => selectedQuestions.includes(q.id))

    // Simular guardado en base de datos SQLite
    setTimeout(() => {
      console.log("Guardando preguntas en SQLite:", questionsToSave)

      // Aquí iría la función real de guardado
      // await guardarPreguntas(questionsToSave)

      setIsSaving(false)
      onQuestionsGenerated(questionsToSave)
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setPdfFile(null)
    setExtractedText("")
    setGeneratedQuestions([])
    setSelectedQuestions([])
    setQuestionConfig({
      multipleChoice: 5,
      trueFalse: 3,
      category: "General",
    })
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
    // Añadir el wrapper modal con backdrop blur
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      {/* Contenedor actual */}
      <div className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Generador de Preguntas con IA</h2>
                  <p className="text-purple-100">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-circle text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${
                        isActive
                          ? "bg-white text-purple-600 border-white"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-purple-300 text-purple-300"
                      }
                    `}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="ml-2 hidden sm:block">
                        <div className={`text-sm font-medium ${isActive ? "text-white" : "text-purple-200"}`}>
                          {step.title}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-purple-300"}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Upload PDF */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Subir Documento PDF</h3>
                  <p className="text-gray-600">Selecciona el archivo PDF del cual deseas generar preguntas</p>
                </div>

                <div className="max-w-md mx-auto">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {pdfFile ? (
                      <div className="space-y-4">
                        <FileText className="w-16 h-16 text-green-500 mx-auto" />
                        <div>
                          <p className="font-medium text-green-700">{pdfFile.name}</p>
                          <p className="text-sm text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {isProcessing && (
                          <div className="flex items-center justify-center gap-2">
                            <div className="loading loading-spinner loading-sm"></div>
                            <span className="text-sm">Procesando PDF...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium">Haz clic para subir PDF</p>
                          <p className="text-sm text-gray-500">O arrastra y suelta el archivo aquí</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </div>

                {extractedText && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Vista previa del contenido extraído
                    </h4>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">{extractedText}</div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Configure Questions */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Configurar Preguntas</h3>
                  <p className="text-gray-600">Especifica qué tipos de preguntas deseas generar</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Tipos de preguntas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Opción Múltiple
                      </h4>
                      <div className="flex items-center gap-4">
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
                          <div className="text-3xl font-bold text-blue-600">{questionConfig.multipleChoice}</div>
                          <div className="text-sm text-gray-600">preguntas</div>
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

                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Verdadero/Falso
                      </h4>
                      <div className="flex items-center gap-4">
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
                          <div className="text-3xl font-bold text-green-600">{questionConfig.trueFalse}</div>
                          <div className="text-sm text-gray-600">preguntas</div>
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

                  {/* Configuración adicional */}
                  <div className="grid md:grid-cols-1 gap-6">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Categoría</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={questionConfig.category}
                        onChange={(e) => setQuestionConfig((prev) => ({ 
                          ...prev, 
                          category: e.target.value 
                        }))}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Resumen de configuración</h4>
                    <div className="text-sm text-purple-700">
                      Se generarán <strong>{questionConfig.multipleChoice + questionConfig.trueFalse}</strong> preguntas (
                      {questionConfig.multipleChoice} de opción múltiple, {questionConfig.trueFalse} de verdadero/falso)
                      en la categoría <strong>{questionConfig.category}</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Generate Questions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Generar Preguntas</h3>
                  <p className="text-gray-600">La IA está procesando el contenido para crear las preguntas</p>
                </div>

                <div className="max-w-md mx-auto">
                  {!isGenerating ? (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
                        <Wand2 className="w-16 h-16 text-purple-600" />
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
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
                        <div className="loading loading-spinner loading-lg text-purple-600"></div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Generando preguntas...</p>
                        <p className="text-sm text-gray-600">
                          La IA está analizando el contenido y creando preguntas personalizadas
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Edit Questions */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Editar Preguntas Generadas</h3>
                    <p className="text-gray-600">Revisa y edita las preguntas antes de guardarlas</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedQuestions.length} de {generatedQuestions.length} seleccionadas
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {generatedQuestions.map((question, index) => {
                    const isSelected = selectedQuestions.includes(question.id)
                    return (
                      <div
                        key={question.id}
                        className="bg-base-100 rounded-lg shadow-lg p-6"
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary mt-1"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(question.id)}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="badge badge-outline">#{index + 1}</span>
                                <span className={`badge ${
                                  question.type === "multiple_choice" ? "badge-info" : "badge-success"
                                }`}>
                                  {question.type === "multiple_choice" ? "Opción Múltiple" : "Verdadero/Falso"}
                                </span>
                                <span className="badge bg-purple-600 text-white">{question.category}</span>
                              </div>
                              <button
                                onClick={() => removeQuestion(question.id)}
                                className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="label">
                                  <span className="label-text font-medium">Pregunta</span>
                                </label>
                                <textarea
                                  className="textarea textarea-bordered w-full"
                                  rows={2}
                                  value={question.text}
                                  onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                                />
                              </div>

                              {question.type === "multiple_choice" ? (
                                <div className="space-y-3">
                                  {question.options.map((option, optIndex) => (
                                    <label
                                      key={optIndex}
                                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-base-200 ${
                                        question.correctAnswer === optIndex
                                          ? 'border-primary bg-primary/10'
                                          : 'border-base-300'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        className="radio radio-primary mr-4"
                                        checked={question.correctAnswer === optIndex}
                                        onChange={() => updateQuestion(question.id, "correctAnswer", optIndex)}
                                      />
                                      <input
                                        type="text"
                                        className="input input-sm flex-1 bg-transparent border-none"
                                        value={option}
                                        onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                                      />
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`tf_${question.id}`}
                                      className="radio radio-primary"
                                      checked={question.correctAnswer === true}
                                      onChange={() => updateQuestion(question.id, "correctAnswer", true)}
                                    />
                                    <span>Verdadero</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`tf_${question.id}`}
                                      className="radio radio-primary"
                                      checked={question.correctAnswer === false}
                                      onChange={() => updateQuestion(question.id, "correctAnswer", false)}
                                    />
                                    <span>Falso</span>
                                  </label>
                                </div>
                              )}

                              <div>
                                <label className="label">
                                  <span className="label-text font-medium">Explicación</span>
                                </label>
                                <textarea
                                  className="textarea textarea-bordered w-full"
                                  rows={2}
                                  value={question.explanation}
                                  onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {generatedQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay preguntas generadas</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Save Questions */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Guardar Preguntas</h3>
                  <p className="text-gray-600">Las preguntas seleccionadas se guardarán en tu banco de preguntas</p>
                </div>

                <div className="max-w-md mx-auto">
                  {!isSaving ? (
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
                        <Save className="w-16 h-16 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg mb-2">¿Guardar {selectedQuestions.length} preguntas?</p>
                        <p className="text-sm text-gray-600 mb-4">
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
                      <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
                        <div className="loading loading-spinner loading-lg text-green-600"></div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Guardando preguntas...</p>
                        <p className="text-sm text-gray-600">Añadiendo las preguntas a tu banco de preguntas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevStep}
              className="btn btn-outline"
              disabled={currentStep === 1 || isProcessing || isGenerating || isSaving}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>

            <div className="text-sm text-gray-500">
              Paso {currentStep} de {steps.length}
            </div>

            <button
              onClick={nextStep}
              className="btn btn-primary"
              disabled={
                currentStep === 5 ||
                (currentStep === 1 && !extractedText) ||
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
    </div>
  )
}

export default AIQuestionGenerator
