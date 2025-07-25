'use client'
import { Sparkles } from 'lucide-react'
import UpdateQuestion from '../forms/updateQuestion'
import DeleteQuestion from '../forms/deleteQuestion'
import ViewQuestion from '../forms/ViewQuestion'

const getTypeBadge = type => {
  switch (type) {
    case 'multiple_choice':
      return 'bg-info text-info-content'
    default:
      return 'bg-accent text-accent-content'
  }
}

const QuestionCard = ({ question, fetchQuestions }) => {
  return (
    <div className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow relative">
      <div className="card-body">
        <div className="flex flex-col">
          <div className="flex-1">
            <h3 className="card-title text-lg mb-3 line-clamp-1">{question.text}</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <div className={`badge ${getTypeBadge(question.type)} font-medium`}>
                {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
              </div>
              <div className="badge badge-outline">{question.category?.name || 'General'}</div>
            </div>
            <div className="flex gap-2">
              {/* Icono de IA generada */}
              {question.source === 'generated' && (
                <div className="tooltip tooltip-left" data-tip="Generado por IA">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
              <ViewQuestion question={question} fetchQuestions={fetchQuestions} />
              <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
              <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
