import { Eye, CheckCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import UpdateQuestion from './updateQuestion'
import DeleteQuestion from './deleteQuestion'

const ViewQuestion = ({ question, fetchQuestions }) => {
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const getTypeLabel = type => {
    return type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'
  }

  return (
    <>
      <button className="btn btn-outline btn-info btn-square btn-sm" onClick={handleOpenModal}>
        <Eye className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="modal modal-open">
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
                {/* Badge para indicar si fue generada por IA */}
                {question.source === 'generated' && (
                  <div className="tooltip" data-tip="Generado por IA">
                    <div className="badge badge-primary gap-1">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </div>
                  </div>
                )}
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
        </div>
      )}
    </>
  )
}

export default ViewQuestion
