import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

const DeleteExam = ({ exam, fetchExams }) => {
  const [loading, setLoading] = useState(false)

  const handleOpenModal = () => {
    document.getElementById('modal_delete_exam' + exam.exam_id).showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_delete_exam' + exam.exam_id).close()
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await window.examAPI.delete(exam.exam_id)
      toast.success('Examen eliminado exitosamente')
      fetchExams()
      handleCloseModal()
    } catch (error) {
      console.error('Error al eliminar el examen:', error)
      toast.error('Error al eliminar el examen')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error hover:text-error-content"
        onClick={handleOpenModal}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <dialog id={'modal_delete_exam' + exam.exam_id} className="modal">
        <div className="modal-box flex flex-col gap-4">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              handleCloseModal()
            }}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg text-red-600">Eliminar examen</h3>
          <p>¿Estás seguro de que deseas eliminar este examen? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-2">
            <button className="btn" type="button" onClick={handleCloseModal} disabled={loading}>
              Cancelar
            </button>
            <button
              className="btn btn-error"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Eliminar'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default DeleteExam
