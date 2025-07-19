import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

import { toast } from 'react-toastify'

const formatMinutes = minutes => {
  if (minutes === 0) return '0:00'
  if (!minutes || isNaN(minutes)) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

const formatDate = dateStr => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}

const formatTime = dateStr => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const ExamHistory = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExam = async () => {
    try {
      const examData = await window.examAPI.getById(id)
      setExam(examData)
    } catch (err) {
      setError(err.message)
      toast.error('Error al cargar el examen')
    }
  }

  const fetchResults = async () => {
    try {
      const resultsData = await window.resultAPI.getByExamId(id)
      setResults(resultsData)
    } catch (err) {
      setError(err.message)
      toast.error('Error al cargar resultados')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchExam(), fetchResults()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleGoBack = () => {
    navigate('/exam/' + id)
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
            <span>Preguntas: {exam.questions_count || exam.questions?.length || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="overflow-y-scroll">
        <h2 className="text-xl font-semibold mb-4">Historial de Resultados</h2>
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-base-content/60 mb-4">No hay resultados para este examen</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
            <div className="grid grid-cols-1 gap-4 pb-4">
              {results.map(result => (
                <div
                  key={result.result_id}
                  className="card bg-base-300 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300 cursor-pointer w-full"
                >
                  <div className="card-body p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="card-title text-xl font-bold text-base-content mb-2">
                          Puntaje: {result.score}%
                        </h2>
                      </div>
                    </div>
                    <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                      {result.exam?.description || ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-base-content/60 mb-4">
                      <div className="flex items-center gap-1">
                        <span>✔️</span>
                        <span>{result.correct_answers} preguntas correctas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>❌</span>
                        <span>{result.incorrect_answers} preguntas incorrectas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{formatMinutes(result.time_used)} tiempo usado</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-base-content/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(result.taken_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(result.taken_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamHistory
