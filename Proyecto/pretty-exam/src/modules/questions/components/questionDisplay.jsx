const getTypeBadge = type => {
  switch (type) {
    case 'multiple_choice':
      return 'badge-info'
    case 'true_false':
      return 'badge-success'
    default:
      return 'badge-secondary'
  }
}

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}) => {
  if (!question) {
    return null
  }

  // Permitir ambos formatos: string o objeto para category
  const categoryText =
    typeof question.category === 'object' && question.category !== null
      ? question.category.name
      : question.category

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      {/* Header de la pregunta */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="badge badge-primary badge-lg">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
        </div>

        <h2 className="text-xl font-semibold mb-2">{question.text}</h2>

        <div className="flex gap-2">
          <span className="badge bg-purple-600 text-white">{categoryText}</span>
          <span className={`badge ${getTypeBadge(question.type)}`}>
            {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
          </span>
        </div>
      </div>

      {/* Opciones de respuesta */}
      <div className="space-y-3">
        {question.options.map(option => (
          <label
            key={option.option_id}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-base-200 ${
              selectedAnswer === option.option_id
                ? 'border-primary bg-primary/10'
                : 'border-base-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.question_id}`}
              value={option.option_id}
              checked={selectedAnswer === option.option_id}
              onChange={() => onAnswerSelect(option.option_id)}
              className="radio radio-primary mr-4"
            />
            <span className="text-base">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default QuestionDisplay
