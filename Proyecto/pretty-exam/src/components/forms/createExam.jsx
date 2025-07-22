'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

const CreateExam = ({ fetchExams }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formErrors, setFormErrors] = useState([])

  const handleOpenModal = () => {
    resetForm()
    document.getElementById('modal_create_exam').showModal()
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setDuration('')
    setLoading(false)
    setFormError('')
    setFormErrors([])
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    setFormError('')
    setFormErrors([])

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

      // Extraer mensaje de error del backend
      let errorMessage = error.message || 'Error desconocido al crear el examen'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      // Si el mensaje contiene múltiples errores separados por comas, mostrarlos como lista
      if (errorMessage.includes(', ')) {
        const errors = errorMessage.split(', ').map(err => err.trim())
        setFormErrors(errors)
        setFormError('')
      } else {
        setFormError(errorMessage)
        setFormErrors([])
      }

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

          {/* Mostrar errores únicos */}
          {formError && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Error de validación</span>
                <span className="text-sm">{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError('')}
                className="btn btn-sm btn-ghost btn-square"
                title="Cerrar mensaje de error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mostrar múltiples errores como alertas separadas */}
          {formErrors.map((error, index) => (
            <div key={index} className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Error de validación</span>
                <span className="text-sm">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newErrors = formErrors.filter((_, i) => i !== index)
                  setFormErrors(newErrors)
                }}
                className="btn btn-sm btn-ghost btn-square"
                title="Cerrar mensaje de error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

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
