'use client'
import UpdateQuestion from './forms/updateQuestion'
import DeleteQuestion from './forms/deleteQuestion'

const getTypeBadge = type => {
  switch (type) {
    case 'multiple_choice':
      return 'bg-blue-500'
    default:
      return 'bg-green-500'
  }
}

const QuestionCard = ({ question, fetchQuestions }) => {
  console.log('Datos de la pregunta recibidos:', question)
  if (question.options) {
    console.log('Opciones de la pregunta:', question.options)
  }

  return (
    <div className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <div className="flex flex-col">
          <div className="flex-1">
            <h3 className="card-title text-lg mb-3">{question.text}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`badge ${getTypeBadge(question.type)}`}>
                {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
              </div>
              <div className="badge badge-outline">{question.category.name}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
            <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
