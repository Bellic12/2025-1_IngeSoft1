import { Tag, Edit2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import CategoryFilter from '../../categories/components/CategoryFilter'

const getInitialOptions = type =>
  type === 'multiple_choice'
    ? [{ text: '', isCorrect: false }]
    : [
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: false },
      ]

const CreateQuestion = ({ fetchQuestions, onClose }) => {
  const [text, setText] = useState('')
  const [type, setType] = useState('multiple_choice')
  const [categoryId, setCategoryId] = useState(null)
  const [categories, setCategories] = useState([])
  const [options, setOptions] = useState(getInitialOptions('multiple_choice'))
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formErrors, setFormErrors] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [, setModalWasOpen] = useState(false)

  useEffect(() => {
    setOptions(getInitialOptions(type))
  }, [type])

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

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
    // Limpiar errores cuando el usuario agregue opciones
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleOnChangeType = event => {
    setType(event.target.value)
    // Limpiar errores cuando el usuario cambie el tipo
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleTextChange = e => {
    setText(e.target.value)
    // Limpiar errores cuando el usuario empiece a escribir
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
  }

  const handleOptionTextChange = (e, index) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text: e.target.value }
    setOptions(newOptions)
    // Limpiar errores cuando el usuario escriba en las opciones
    if (formError) setFormError('')
    if (formErrors.length > 0) setFormErrors([])
  }

  const handleRemoveOption = index => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setText('')
    setType('multiple_choice')
    setCategoryId(null)
    setOptions(getInitialOptions('multiple_choice'))
    setLoading(false)
    setFormError('')
    setFormErrors([])
  }

  const getCurrentCategoryName = () => {
    if (!categoryId) return 'Sin categoría'
    const category = categories.find(c => c.category_id === categoryId)
    return category?.name || 'Categoría seleccionada'
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError('')
    setFormErrors([])

    try {
      // Usar directamente los datos sin validación local
      const questionData = {
        text,
        type,
        category_id: categoryId,
        options: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      }

      setLoading(true)
      await window.questionAPI.create(questionData)
      resetForm()
      if (onClose) {
        onClose()
      }
      toast.success('Pregunta creada exitosamente')
      fetchQuestions()
    } catch (error) {
      // Extraer el mensaje de error específico del controlador
      let errorMessage = error.message || 'Error al crear pregunta'

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

  return (
    <>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

        {/* Pregunta */}
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
            <select className="select w-full" value={type} onChange={handleOnChangeType}>
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
                  setModalWasOpen(true)
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
                      setModalWasOpen(true)
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

        {/* Opciones */}
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
                  className={`input w-full ${formError ? 'input-error' : ''}`}
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
                  name="true_false_option_modal"
                  className="radio"
                  checked={!!options[0]?.isCorrect}
                  onChange={() => handleOnSelectOption({ target: { checked: true } }, 0)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="text" className="input w-full bg-red-800" value="Falso" readOnly />
                <input
                  type="radio"
                  name="true_false_option_modal"
                  className="radio"
                  checked={!!options[1]?.isCorrect}
                  onChange={() => handleOnSelectOption({ target: { checked: true } }, 1)}
                />
              </div>
            </>
          )}
          {type === 'multiple_choice' && (
            <button className="btn btn-primary btn-outline" type="button" onClick={handleAddOption}>
              Añadir opción
            </button>
          )}
        </div>

        <button className="btn btn-secondary btn-outline" type="submit" disabled={loading}>
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Crear pregunta'
          )}
        </button>
      </form>

      {/* Category Selector Modal */}
      <CategoryFilter
        isOpen={showCategorySelector}
        onClose={async () => {
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
          setModalWasOpen(false)
        }}
        selectedCategories={categoryId ? [categoryId] : []}
        onCategorySelect={async categories => {
          setCategoryId(categories[0] || null)
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
          setModalWasOpen(false)
        }}
        singleSelect={true}
        title="Seleccionar Categoría"
        editingCategoryId={editingCategoryId}
      />
    </>
  )
}

export default CreateQuestion
