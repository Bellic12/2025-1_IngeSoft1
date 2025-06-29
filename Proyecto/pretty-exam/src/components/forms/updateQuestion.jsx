import { Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const getInitialOptions = (type, optionsFromQuestion) => {
  if (optionsFromQuestion && optionsFromQuestion.length > 0) {
    return optionsFromQuestion.map(opt => ({
      text: opt.text,
      isCorrect: opt.isCorrect ?? opt.is_correct,
      option_id: opt.option_id,
    }))
  }
  return type === 'multiple_choice'
    ? [{ text: '', isCorrect: false }]
    : [
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: false },
      ]
}

const UpdateQuestion = ({ question, fetchQuestions }) => {
  const [text, setText] = useState('')
  const [type, setType] = useState('multiple_choice')
  const [options, setOptions] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [categoryId, setCategoryId] = useState(1) // Valor por defecto
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (question) {
      setText(question.text || '')
      setType(question.type || 'multiple_choice')
      setOptions(getInitialOptions(question.type, question.options))
    }
  }, [question])

  useEffect(() => {
    // Si el tipo cambia, pero no es por cargar la pregunta, reiniciar opciones
    if (question && type !== question.type) {
      setOptions(getInitialOptions(type))
    }
  }, [type])

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

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
  }

  const handleRemoveOption = index => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (type === 'multiple_choice' && !options.some(option => option.isCorrect)) {
      toast.error('Debe seleccionar al menos una opción correcta')
      return
    }
    setLoading(true)
    try {
      await window.questionAPI.update(question.question_id, {
        text,
        type,
        category_id: categoryId,
        options: options.map(opt => ({
          text: opt.text,
          is_correct: opt.isCorrect,
          option_id: opt.option_id || undefined,
        })),
      })
      toast.success('Pregunta actualizada correctamente')
      fetchQuestions()
      document.getElementById('modal_update_question' + question.question_id).close()
    } catch (error) {
      console.error('Error al actualizar la pregunta:', error)
      toast.error('Error al actualizar la pregunta')
    }
    setLoading(false)
  }

  const handleOpenModal = () => {
    document.getElementById('modal_update_question' + question.question_id).showModal()
  }

  return (
    <>
      <button className="btn btn-warning btn-square" onClick={handleOpenModal}>
        <Pencil />
      </button>
      <dialog id={'modal_update_question' + question.question_id} className="modal">
        <form method="dialog" className="modal-box flex flex-col gap-4" onSubmit={handleSubmit}>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={e => {
              e.preventDefault()
              document.getElementById('modal_update_question' + question.question_id).close()
            }}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg">Editar pregunta</h3>
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
                <div key={option.option_id || index} className="flex items-center gap-2">
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
            <span className={loading ? 'loading' : ''}>{loading ? '' : 'Actualizar pregunta'}</span>
          </button>
        </form>
      </dialog>
    </>
  )
}

export default UpdateQuestion
