import { Eye, CheckCircle } from 'lucide-react'
import UpdateQuestion from './updateQuestion'
import DeleteQuestion from './deleteQuestion'

const ViewQuestion = ({ question, fetchQuestions }) => {
  const handleOpenModal = () => {
    document.getElementById('modal_view_question' + question.question_id).showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_view_question' + question.question_id).close()
  }

  const getTypeLabel = type => {
    return type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'
  }

  return (
    <>
      <button className="btn btn-outline btn-info btn-square btn-sm" onClick={handleOpenModal}>
        <Eye className="w-4 h-4" />
      </button>

      <dialog id={'modal_view_question' + question.question_id} className="modal">
        <div className="modal-box max-w-2xl">
          <button
            className="btn btn-outline btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleCloseModal}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">Detalles de la pregunta</h3>

          {/* Question text */}
          <div className="mb-6">
            <h4 className="font-semibold text-md mb-2">Pregunta:</h4>
            <p className="text-base bg-base-200 p-4 rounded-lg">{question.text}</p>
          </div>

          {/* Question info with action buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-wrap gap-2">
              <div className="badge badge-info font-medium">{getTypeLabel(question.type)}</div>
              <div className="badge badge-outline">{question.category?.name || 'General'}</div>
            </div>
            <div className="flex gap-2">
              <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
              <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
            </div>
          </div>

          {/* Options */}
          <div>
            <h4 className="font-semibold text-md mb-3">Opciones de respuesta:</h4>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div
                  key={option.option_id || index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    option.is_correct || option.isCorrect
                      ? 'bg-success/20 border-success'
                      : 'bg-base-200 border-base-300'
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-medium text-sm opacity-70">Opción {index + 1}:</span>
                    <p className="text-base">{option.text}</p>
                  </div>
                  {(option.is_correct || option.isCorrect) && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Correcta</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default ViewQuestion
