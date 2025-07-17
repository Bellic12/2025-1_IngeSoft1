import { Calendar, Clock, HelpCircle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UpdateExam from './forms/updateExam'
import DeleteExam from './forms/deleteExam'

const Exam = ({ exam, fetchExams }) => {
  const navigate = useNavigate()

  // Format dates
  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleExamClick = () => {
    navigate(`/exam/${exam.exam_id}`)
  }

  const handleStartSimulation = e => {
    e.stopPropagation()
    navigate(`/exam/${exam.exam_id}/simulacion`)
  }

  return (
    <div
      className="card bg-base-200 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleExamClick}
    >
      <div className="card-body p-6">
        {/* Header with action buttons */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="card-title text-xl font-bold text-base-content mb-2">{exam?.name}</h2>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-success btn-sm btn-circle"
              onClick={handleStartSimulation}
              title="Iniciar simulación"
            >
              <Play className="w-4 h-4" />
            </button>
            <UpdateExam exam={exam} fetchExams={fetchExams} />
            <DeleteExam exam={exam} fetchExams={fetchExams} />
          </div>
        </div>

        {/* Description */}
        <p className="text-base-content/70 text-sm mb-4 line-clamp-2">{exam?.description}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-base-content/60 mb-4">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            <span>{exam?.question_count || 0} preguntas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{exam?.duration_minutes || exam?.duration || 'N/A'} minutos</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-base-content/60">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Creado: {formatDate(exam?.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Actualizado: {formatDate(exam?.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exam
