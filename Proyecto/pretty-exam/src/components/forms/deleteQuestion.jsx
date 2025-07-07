import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

const DeleteQuestion = ({ question, fetchQuestions }) => {
  const [loading, setLoading] = useState(false)

  const handleOpenModal = () => {
    document.getElementById('modal_delete_question' + question.question_id).showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_delete_question' + question.question_id).close()
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await window.questionAPI.delete(question.question_id)
      toast.success('Pregunta eliminada exitosamente')
      fetchQuestions()
      handleCloseModal()
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error)
      toast.error('Error al eliminar la pregunta')
    }
    setLoading(false)
  }

  return (
    <>
      <button className="btn btn-outline btn-error btn-square btn-sm" onClick={handleOpenModal}>
        <Trash2 className="w-4 h-4" />
      </button>
      <dialog id={'modal_delete_question' + question.question_id} className="modal">
        <div className="modal-box flex flex-col gap-4">
          <button
            className="btn btn-outline btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              handleCloseModal()
            }}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg text-red-600">Eliminar pregunta</h3>
          <p>
            ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-outline btn-error"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Eliminar'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default DeleteQuestion
