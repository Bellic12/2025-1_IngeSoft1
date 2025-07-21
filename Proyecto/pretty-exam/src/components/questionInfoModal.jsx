import { Info } from 'lucide-react'
import UpdateQuestion from './forms/updateQuestion'
import DeleteQuestion from './forms/deleteQuestion'

const getTypeBadge = type => {
  switch (type) {
    case 'multiple_choice':
      return 'badge-info'
    case 'true_false':
      return 'badge-accent'
    default:
      return 'badge-secondary'
  }
}

const QuestionInfo = ({ question, fetchQuestions }) => {
  const handleOpenModal = () => {
    document.getElementById('modal_question_info' + question.question_id).showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_question_info' + question.question_id).close()
  }

  return (
    <>
      <button className="btn btn-outline btn-info btn-square btn-sm" onClick={handleOpenModal}>
        <Info className="w-4 h-4" />
      </button>

      <dialog id={'modal_question_info' + question.question_id} className="modal">
        <div className="modal-box max-w-2xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleCloseModal}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">Detalles de la pregunta</h3>

          {/* Pregunta completa */}
          <div className="mb-6 p-4 bg-base-300 rounded-lg border border-neutral">
            <p className="text-lg leading-relaxed font-medium">{question.text}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex flex-wrap gap-2">
              <div className={`badge font-medium ${getTypeBadge(question.type)}`}>
                {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
              </div>
              <div className="badge font-medium badge-outline">
                {question.category?.name || 'General'}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div onClick={e => e.stopPropagation()}>
                <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
              </div>
              <div onClick={e => e.stopPropagation()}>
                <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
              </div>
            </div>
          </div>

          {/* Opciones si es de opción múltiple */}
          {question.options && question.options.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Opciones:</h4>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={option.option_id || index}
                    className={`p-3 rounded-lg border ${
                      option.is_correct || option.isCorrect
                        ? 'border-success bg-success/10'
                        : 'border-error bg-error/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option.text}</span>
                      </div>
                      {(option.is_correct || option.isCorrect) && (
                        <span className="badge badge-success font-medium badge-sm">Correcta</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>
    </>
  )
}

export default QuestionInfo
