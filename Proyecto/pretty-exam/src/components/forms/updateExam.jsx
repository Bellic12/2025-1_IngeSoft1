import { Edit } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const UpdateExam = ({ exam, fetchExams }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (exam) {
      setName(exam.name || '')
      setDescription(exam.description || '')
      setDuration(exam.duration || '')
    }
  }, [exam])

  const handleOpenModal = () => {
    // Reset form with current exam data
    setName(exam.name || '')
    setDescription(exam.description || '')
    setDuration(exam.duration || '')
    document.getElementById('modal_update_exam' + exam.exam_id).showModal()
  }

  const handleCloseModal = () => {
    document.getElementById('modal_update_exam' + exam.exam_id).close()
  }

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('El nombre del examen es obligatorio')
      return false
    }

    if (!description.trim()) {
      toast.error('La descripción del examen es obligatoria')
      return false
    }

    if (!duration.trim()) {
      toast.error('La duración del examen es obligatoria')
      return false
    }

    return true
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const updatedExam = await window.examAPI.update(exam.exam_id, {
        name: name.trim(),
        description: description.trim(),
        duration: duration.trim(),
      })

      console.log('Examen actualizado:', updatedExam)
      toast.success('Examen actualizado exitosamente')
      fetchExams()
      handleCloseModal()
    } catch (error) {
      console.error('Error al actualizar el examen:', error)
      toast.error('Error al actualizar el examen')
    }
    setLoading(false)
  }

  return (
    <>
      <button className="btn btn-ghost btn-sm btn-circle text-warning hover:bg-warning hover:text-warning-content" onClick={handleOpenModal}>
        <Edit className="w-4 h-4" />
      </button>
      <dialog id={'modal_update_exam' + exam.exam_id} className="modal">
        <form
          method="dialog"
          className="modal-box flex flex-col gap-4 bg-base-300"
          onSubmit={handleSubmit}
        >
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              handleCloseModal()
            }}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg text-base-content">Actualizar examen</h3>

          {/* Nombre */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Nombre</span>
            </label>
            <input
              type="text"
              placeholder="Nombre del examen"
              className="input input-bordered w-full bg-base-100"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              placeholder="Descripción del examen"
              className="textarea textarea-bordered w-full h-24 bg-base-100 resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Duración */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Duración</span>
            </label>
            <input
              type="text"
              placeholder="Ej: 60 minutos, 1 hora, etc."
              className="input input-bordered w-full bg-base-100"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-warning mt-4" type="submit" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Actualizar'}
          </button>
        </form>
      </dialog>
    </>
  )
}

export default UpdateExam