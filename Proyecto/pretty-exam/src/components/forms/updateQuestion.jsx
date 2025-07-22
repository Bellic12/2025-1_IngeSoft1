import { Pencil, Tag, Edit2, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import CategoryFilter from '../CategoryFilter'

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
  const [categoryId, setCategoryId] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formErrors, setFormErrors] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const originalState = useRef({})

  useEffect(() => {
    if (question) {
      setText(question.text || '')
      setType(question.type || 'multiple_choice')
      setCategoryId(question.category_id || null)
      setOptions(getInitialOptions(question.type, question.options))
      originalState.current = {
        text: question.text || '',
        type: question.type || 'multiple_choice',
        categoryId: question.category_id || null,
        options: getInitialOptions(question.type, question.options),
      }
    }
  }, [question])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await window.categoryAPI.getAll()
      setCategories(result)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!question) return
    setOptions(prevOptions => {
      if (type === 'multiple_choice') {
        if (
          question.type === 'true_false' ||
          (prevOptions.length === 2 &&
            prevOptions[0].text === 'Verdadero' &&
            prevOptions[1].text === 'Falso')
        ) {
          return [{ text: '', isCorrect: false }]
        }
        return prevOptions.length > 0 && prevOptions[0].text !== 'Verdadero'
          ? prevOptions
          : [{ text: '', isCorrect: false }]
      } else if (type === 'true_false') {
        return [
          { text: 'Verdadero', isCorrect: false },
          { text: 'Falso', isCorrect: false },
        ]
      }
      return prevOptions
    })
  }, [type])

  const handleOnChangeType = event => {
    setType(event.target.value)
    // Limpiar errores cuando el usuario cambie el tipo
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleOnSelectOption = (e, index) => {
    if (type === 'multiple_choice') {
      const newOptions = [...options]
      newOptions[index].isCorrect = e.target.checked
      setOptions(newOptions)
    } else {
      // Para true_false: marcar solo la opción seleccionada como correcta
      const newOptions = options.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }))
      setOptions(newOptions)
    }
    // Limpiar errores cuando el usuario seleccione opciones
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleOptionTextChange = (e, index) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text: e.target.value }
    setOptions(newOptions)
    // Limpiar errores cuando el usuario escriba en las opciones
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
    // Limpiar errores cuando el usuario agregue opciones
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleTextChange = e => {
    setText(e.target.value)
    // Limpiar errores cuando el usuario empiece a escribir
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleRemoveOption = index => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError('')
    setFormErrors([])

    try {
      // Usar directamente los datos sin validación local
      const updateData = {
        text,
        type,
        category_id: categoryId,
        options: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      }

      setLoading(true)
      await window.questionAPI.update(question.question_id, updateData)
      toast.success('Pregunta actualizada correctamente')
      fetchQuestions()
      setShowModal(false)
      setLoading(false)
    } catch (error) {
      console.error('Error updating question:', error)

      // Extraer el mensaje de error específico del controlador
      let errorMessage = error.message || 'Error al actualizar pregunta'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      // Verificar si el mensaje contiene múltiples errores separados por comas
      if (errorMessage.includes(', ')) {
        // Dividir por comas y limpiar espacios
        const errors = errorMessage.split(', ').map(err => err.trim())
        setFormErrors(errors)
      } else {
        // Un solo error
        setFormError(errorMessage)
      }
      setLoading(false)
    }
  }

  const getCurrentCategoryName = () => {
    if (!categoryId) return 'Sin categoría'
    const category = categories.find(c => c.category_id === categoryId)
    return category?.name || 'Categoría seleccionada'
  }

  const resetForm = () => {
    setText(originalState.current.text)
    setType(originalState.current.type)
    setOptions(originalState.current.options)
    setCategoryId(originalState.current.categoryId)
    setLoading(false)
    setFormError('')
    setFormErrors([])
  }

  const handleOpenModal = async () => {
    resetForm()
    await fetchCategories()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    resetForm()
    setShowModal(false)
  }

  return (
    <>
      <button className="btn btn-outline btn-warning btn-square btn-sm" onClick={handleOpenModal}>
        <Pencil className="w-4 h-4" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box flex flex-col gap-4 bg-base-300">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">Editar pregunta</h3>

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

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Question */}
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Pregunta</span>
                </label>
                <input
                  type="text"
                  placeholder="Escribe la pregunta aquí"
                  className={`input w-full ${formError || formErrors.length > 0 ? 'input-error' : ''}`}
                  value={text}
                  onChange={handleTextChange}
                />
              </div>
              {/* Type and Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Category */}
                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">Categoría</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-error text-white flex-1 justify-start"
                      onClick={() => {
                        setTimeout(() => setShowCategorySelector(true), 100)
                      }}
                    >
                      <Tag className="w-4 h-4" />
                      {getCurrentCategoryName()}
                    </button>
                    {categoryId && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-square"
                          onClick={() => {
                            setEditingCategoryId(categoryId)
                            setTimeout(() => setShowCategorySelector(true), 100)
                          }}
                          title="Editar categoría"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-square"
                          onClick={() => setCategoryId(null)}
                          title="Limpiar categoría"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
                      />
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!option.isCorrect}
                        onChange={e => handleOnSelectOption(e, index)}
                      />
                      <button
                        className="btn btn-primary btn-outline btn-sm rounded-xl"
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
                        type="radio"
                        name={`true_false_option_${question.question_id}`}
                        className="radio"
                        checked={!!options.find(opt => opt.text === 'Verdadero')?.isCorrect}
                        onChange={() => {
                          const newOptions = options.map(opt => ({
                            ...opt,
                            isCorrect: opt.text === 'Verdadero',
                          }))
                          setOptions(newOptions)
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input w-full bg-red-800"
                        value="Falso"
                        readOnly
                      />
                      <input
                        type="radio"
                        name={`true_false_option_${question.question_id}`}
                        className="radio"
                        checked={!!options.find(opt => opt.text === 'Falso')?.isCorrect}
                        onChange={() => {
                          const newOptions = options.map(opt => ({
                            ...opt,
                            isCorrect: opt.text === 'Falso',
                          }))
                          setOptions(newOptions)
                        }}
                      />
                    </div>
                  </>
                )}
                {type === 'multiple_choice' && (
                  <button
                    className="btn btn-primary btn-outline"
                    type="button"
                    onClick={handleAddOption}
                  >
                    Añadir opción
                  </button>
                )}
              </div>
              <button className="btn btn-secondary btn-outline" type="submit" disabled={loading}>
                <span className={loading ? 'loading' : ''}>
                  {loading ? '' : 'Actualizar pregunta'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Selector Modal */}
      <CategoryFilter
        isOpen={showCategorySelector}
        onClose={async () => {
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
        }}
        selectedCategories={categoryId ? [categoryId] : []}
        onCategorySelect={async categories => {
          setCategoryId(categories[0] || null)
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
        }}
        singleSelect={true}
        title="Seleccionar Categoría"
        editingCategoryId={editingCategoryId}
      />
    </>
  )
}

export default UpdateQuestion
