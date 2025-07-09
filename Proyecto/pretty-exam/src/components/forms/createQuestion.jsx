import { Plus, Tag, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import QuestionFactory from '../../factories/QuestionFactory'
import CategoryFilter from '../CategoryFilter'

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
  const [categoryId, setCategoryId] = useState(null)
  const [categories, setCategories] = useState([])
  const [options, setOptions] = useState(getInitialOptions('multiple_choice'))
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [modalWasOpen, setModalWasOpen] = useState(false)

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
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError('')
    
    if (!categoryId) {
      setFormError('Debes seleccionar una categoría')
      return
    }
    
    try {
      const questionObj = QuestionFactory.createQuestion(type, {
        text,
        category_id: categoryId,
        options: options.map(opt => ({
          text: opt.text,
          is_correct: opt.isCorrect,
        })),
      })
      questionObj.validate()
      setLoading(true)
      // eslint-disable-next-line
      const createdQuestion = await window.questionAPI.create(questionObj.toAPIFormat())
      resetForm()
      document.getElementById('modal_create_question').close()
      toast.success('Pregunta creada exitosamente')
      fetchQuestions()
    } catch (error) {
      setFormError(error.message)
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
        <form
          method="dialog"
          className="modal-box flex flex-col gap-4 bg-base-300"
          onSubmit={handleSubmit}
        >
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
                  className={`btn flex-1 justify-start ${categoryId ? 'btn-outline' : 'btn-outline btn-error'}`}
                  onClick={() => {
                    setModalWasOpen(true)
                    document.getElementById('modal_create_question').close()
                    setTimeout(() => setShowCategorySelector(true), 100)
                  }}
                >
                  <Tag className="w-4 h-4" />
                  {categoryId 
                    ? categories.find(c => c.category_id === categoryId)?.name || 'Categoría seleccionada'
                    : 'Seleccionar categoría'
                  }
                </button>
                {categoryId && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-square"
                      onClick={() => {
                        setEditingCategoryId(categoryId)
                        setModalWasOpen(true)
                        document.getElementById('modal_create_question').close()
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
                    className="btn btn-primary btn-sm btn-outline rounded-xl"
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
                    name="true_false_option"
                    className="radio"
                    checked={!!options[0]?.isCorrect}
                    onChange={() => handleOnSelectOption({ target: { checked: true } }, 0)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" className="input w-full bg-red-800" value="Falso" readOnly />
                  <input
                    type="radio"
                    name="true_false_option"
                    className="radio"
                    checked={!!options[1]?.isCorrect}
                    onChange={() => handleOnSelectOption({ target: { checked: true } }, 1)}
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
          {formError && <div className="text-error text-sm mb-2">{formError}</div>}
          <button className="btn btn-secondary btn-outline" type="submit" disabled={loading}>
            <span className={loading ? 'loading' : ''}>{loading ? '' : 'Crear pregunta'}</span>
          </button>
        </form>
      </dialog>

      {/* Category Selector Modal */}
      <CategoryFilter
        isOpen={showCategorySelector}
        onClose={() => {
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          // Reopen the main modal if it was open before
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_create_question').showModal()
            }, 100)
          }
        }}
        selectedCategories={categoryId ? [categoryId] : []}
        onCategorySelect={(categories) => {
          setCategoryId(categories[0] || null)
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          // Refresh categories to get updated names
          fetchCategories()
          // Reopen the main modal if it was open before
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_create_question').showModal()
            }, 100)
          }
        }}
        singleSelect={true}
        title="Seleccionar Categoría"
        editingCategoryId={editingCategoryId}
      />
    </>
  )
}

export default CreateQuestion
