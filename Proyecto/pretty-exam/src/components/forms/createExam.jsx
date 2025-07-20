'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

const CreateExam = ({ fetchExams }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDuration] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpenModal = () => {
    resetForm()
    document.getElementById('modal_create_exam').showModal()
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setDuration('')
    setLoading(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()

    setLoading(true)

    try {
      await window.examAPI.create({
        name: name.trim(),
        description: description.trim(),
        duration_minutes: durationMinutes.trim(),
      })

      resetForm()
      document.getElementById('modal_create_exam').close()
      toast.success('Examen creado exitosamente')
      if (fetchExams) {
        fetchExams()
      }
    } catch (error) {
      console.error('Error al crear el examen:', error)
      toast.error('Error al crear el examen')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="btn btn-primary btn-circle btn-xl fixed bottom-4 right-4 z-50"
        onClick={handleOpenModal}
      >
        <Plus />
      </button>

      <dialog id="modal_create_exam" className="modal">
        <form
          method="dialog"
          className="modal-box flex flex-col gap-4 bg-base-300"
          onSubmit={handleSubmit}
        >
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              document.getElementById('modal_create_exam').close()
              resetForm()
            }}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg text-base-content">Crear examen</h3>

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
              <span className="label-text">Duración (minutos)</span>
            </label>
            <input
              type="number"
              placeholder="Ej: 60"
              className="input input-bordered w-full bg-base-100"
              value={durationMinutes}
              onChange={e => setDuration(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary mt-4" type="submit" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Crear'}
          </button>
        </form>
      </dialog>
    </>
  )
}

export default CreateExam
