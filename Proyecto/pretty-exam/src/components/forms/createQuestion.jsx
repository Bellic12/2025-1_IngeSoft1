import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const getInitialOptions = type =>
  type === 'multiple_choice'
    ? [{ text: '', isCorrect: false }]
    : [
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: false },
      ]

const CreateQuestion = ({ fetchQuestions }) => {
  const [text, setText] = useState('')
  const [type, setType] = useState('multiple_choice')
  const [options, setOptions] = useState(getInitialOptions('multiple_choice'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setOptions(getInitialOptions(type))
  }, [type])

  const handleOpenModal = () => {
    resetForm()
    document.getElementById('modal_create_question').showModal()
  }

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
  }

  const handleOnChangeType = event => {
    setType(event.target.value)
  }

  const handleOnSelectOption = (e, index) => {
    const newOptions = [...options]
    if (type === 'multiple_choice') {
      newOptions[index].isCorrect = e.target.checked
    } else {
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index ? e.target.checked : false
      })
    }
    setOptions(newOptions)
  }

  const handleOptionTextChange = (e, index) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text: e.target.value }
    setOptions(newOptions)
  }

  const handleRemoveOption = index => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setText('')
    setType('multiple_choice')
    setOptions(getInitialOptions('multiple_choice'))
    setLoading(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (type === 'multiple_choice' && !options.some(option => option.isCorrect)) {
      toast.error('Debe seleccionar al menos una opción correcta')
      return
    }
    setLoading(true)
    try {
      const createdQuestion = await window.questionAPI.create({
        text,
        type,
        category_id: 1,
        options: options.map(opt => ({
          text: opt.text,
          is_correct: opt.isCorrect,
        })),
      })
      console.log('Pregunta creada:', createdQuestion)
      resetForm()
      document.getElementById('modal_create_question').close()
      toast.success('Pregunta creada exitosamente')
      fetchQuestions()
    } catch (error) {
      console.error('Error al crear la pregunta:', error)
      toast.error('Error al crear la pregunta')
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
      <dialog id="modal_create_question" className="modal">
        <form method="dialog" className="modal-box flex flex-col gap-4" onSubmit={handleSubmit}>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              document.getElementById('modal_create_question').close()
              resetForm()
            }}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg">Crear pregunta</h3>
          {/* Question */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Pregunta</span>
            </label>
            <input
              type="text"
              placeholder="Escribe la pregunta aquí"
              className="input w-full"
              value={text}
              onChange={e => setText(e.target.value)}
              required
            />
          </div>
          {/* Type */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Tipo de pregunta</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={type}
              onChange={handleOnChangeType}
            >
              <option value="multiple_choice">Opción múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
            </select>
          </div>
          {/* Options */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Opciones</span>
            </label>
            {type === 'multiple_choice' ? (
              options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Opción ${index + 1}`}
                    className="input w-full"
                    value={option.text}
                    onChange={e => handleOptionTextChange(e, index)}
                    required
                  />
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={!!option.isCorrect}
                    onChange={e => handleOnSelectOption(e, index)}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input w-full bg-green-800"
                    value="Verdadero"
                    readOnly
                  />
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={!!options[0]?.isCorrect}
                    onChange={e => handleOnSelectOption(e, 0)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" className="input w-full bg-red-800" value="Falso" readOnly />
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={!!options[1]?.isCorrect}
                    onChange={e => handleOnSelectOption(e, 1)}
                  />
                </div>
              </>
            )}
            {type === 'multiple_choice' && (
              <button className="btn btn-secondary" type="button" onClick={handleAddOption}>
                Añadir opción
              </button>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <span className={loading ? 'loading' : ''}>{loading ? '' : 'Crear pregunta'}</span>
          </button>
        </form>
      </dialog>
    </>
  )
}

export default CreateQuestion
