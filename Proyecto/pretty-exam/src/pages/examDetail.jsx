import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Play, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import Question from '../components/question'
import AddQuestionsModal from '../components/forms/addQuestionsModal'

const ExamDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddQuestions, setShowAddQuestions] = useState(false)

  const fetchExam = async () => {
    try {
      const examData = await window.examAPI.getById(id)
      setExam(examData)
    } catch (err) {
      setError(err.message)
      toast.error('Error al cargar el examen')
    }
  }

  const fetchExamQuestions = async () => {
    try {
      const questionsData = await window.examAPI.getQuestions(id)
      setQuestions(questionsData)
    } catch (err) {
      console.error('Error al cargar preguntas del examen:', err)
      setQuestions([])
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchExam(), fetchExamQuestions()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStartSimulation = () => {
    navigate(`/exam/${id}/simulacion`)
  }

  const handleAddQuestions = () => {
    setShowAddQuestions(true)
  }

  const handleGoBack = () => {
    navigate('/exams')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-xl" />
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-error">Error: {error || 'Examen no encontrado'}</p>
        <button className="btn btn-primary" onClick={handleGoBack}>
          Volver a exámenes
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-circle" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">{exam.name}</h1>
        </div>

        {/* Exam info */}
        <div className="bg-base-200 p-4 rounded-lg">
          <p className="text-base-content/70 mb-2">{exam.description}</p>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span>Duración: {exam.duration_minutes || exam.duration || 'N/A'} minutos</span>
            <span>Preguntas: {questions.length}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button className="btn btn-success" onClick={handleStartSimulation}>
            <Play className="w-4 h-4" />
            Iniciar Simulación
          </button>
          <button className="btn btn-primary" onClick={handleAddQuestions}>
            <Plus className="w-4 h-4" />
            Gestionar Preguntas
          </button>
        </div>
      </div>

      {/* Questions section */}
      <div style={{ height: 'calc(100vh - 300px)' }} className="overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Preguntas del Examen</h2>
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-base-content/60 mb-4">Este examen no tiene preguntas asignadas</p>
            <button className="btn btn-primary" onClick={handleAddQuestions}>
              <Plus className="w-4 h-4" />
              Añadir Primera Pregunta
            </button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {questions.map(question => (
                <Question
                  key={question.question_id}
                  question={question}
                  fetchQuestions={fetchExamQuestions}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Questions Modal */}
      {showAddQuestions && (
        <AddQuestionsModal
          examId={id}
          onClose={() => setShowAddQuestions(false)}
          onQuestionsAdded={fetchExamQuestions}
        />
      )}
    </div>
  )
}

export default ExamDetail
