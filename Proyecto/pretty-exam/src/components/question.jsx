'use client'
import { useState } from 'react'
import UpdateQuestion from './forms/updateQuestion'
import DeleteQuestion from './forms/deleteQuestion'
import QuestionInfo from './questionInfoModal'

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

const QuestionCard = ({ question, fetchQuestions }) => {
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCardClick = e => {
    // Solo abrir modal si no se clickeó en un botón
    if (!e.target.closest('.btn')) {
      handleOpenModal()
    }
  }

  return (
    <>
      <div
        className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="card-body flex flex-col flex-1">
          <div className="flex-1 flex flex-col">
            <h3 className="card-title text-lg mb-4 line-clamp-1">{question.text}</h3>
            <div className="mt-auto">
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <div className={`badge font-medium ${getTypeBadge(question.type)}`}>
                    {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Verdadero/Falso'}
                  </div>
                  <div className="badge font-medium badge-outline">
                    {question.category?.name || 'General'}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <UpdateQuestion question={question} fetchQuestions={fetchQuestions} />
                  <DeleteQuestion question={question} fetchQuestions={fetchQuestions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionInfo
        question={question}
        fetchQuestions={fetchQuestions}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  )
}

export default QuestionCard
