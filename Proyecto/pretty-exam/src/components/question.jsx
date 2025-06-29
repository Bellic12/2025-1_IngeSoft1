import UpdateQuestion from './forms/updateQuestion'
import DeleteQuestion from './forms/deleteQuestion'

const Question = ({ question, fetchQuestions }) => {
  return (
    <div className="card bg-primary card-border">
      <div className="card-body">
        <h2 className="card-title">{question?.text}</h2>
        <p className="text-sm text-neutral-content">
          {question?.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
        </p>
        <div className="card-actions justify-end">
          <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
          <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
        </div>
      </div>
    </div>
  )
}

export default Question
