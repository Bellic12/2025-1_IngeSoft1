import { Plus, X } from 'lucide-react'
import CreateQuestion from './createQuestion'

const CreateQuestionModal = ({ fetchQuestions }) => {
  const handleOpenModal = () => {
    document.getElementById('modal_create_question').showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_create_question').close()
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="btn btn-primary btn-circle btn-xl fixed bottom-4 right-4 z-50"
        onClick={handleOpenModal}
      >
        <Plus />
      </button>

      {/* Modal */}
      <dialog id="modal_create_question" className="modal">
        <div className="modal-box w-full max-w-2xl bg-base-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Crear Nueva Pregunta</h3>
            <button className="btn btn-ghost btn-circle" onClick={handleCloseModal}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <CreateQuestion fetchQuestions={fetchQuestions} onClose={handleCloseModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>
    </>
  )
}

export default CreateQuestionModal
