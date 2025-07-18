import { Pencil, Tag, Edit2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import QuestionFactory from '../../factories/QuestionFactory'
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
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [modalWasOpen, setModalWasOpen] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

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

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
  }

  const handleRemoveOption = index => {
    setOptions(options.filter((_, i) => i !== index))
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
          option_id: opt.option_id || undefined,
        })),
      })
      questionObj.validate()
      setLoading(true)
      await window.questionAPI.update(question.question_id, {
        ...questionObj.toAPIFormat(),
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
      setFormError(error.message)
      setLoading(false)
    }
  }

  const getCurrentCategoryName = () => {
    if (!categoryId) return 'Seleccionar categoría'
    const category = categories.find(c => c.category_id === categoryId)
    return category?.name || 'Categoría seleccionada'
  }

  const resetForm = () => {
    setText(originalState.current.text)
    setType(originalState.current.type)
    setOptions(originalState.current.options)
    setLoading(false)
    setFormError('')
  }

  const handleOpenModal = async () => {
    resetForm()
    await fetchCategories()
    document.getElementById('modal_update_question' + question.question_id).showModal()
  }

  const handleCloseModal = e => {
    e.preventDefault()
    resetForm()
    document.getElementById('modal_update_question' + question.question_id).close()
  }

  return (
    <>
      <button className="btn btn-outline btn-primary btn-square btn-sm" onClick={handleOpenModal}>
        <Pencil className="w-4 h-4" />
      </button>
      <dialog id={'modal_update_question' + question.question_id} className="modal">
        <form
          method="dialog"
          className="modal-box flex flex-col gap-4 bg-base-300"
          onSubmit={handleSubmit}
        >
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleCloseModal}
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
                    document.getElementById('modal_update_question' + question.question_id).close()
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
                        document.getElementById('modal_update_question' + question.question_id).close()
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
                    required
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
                  <input type="text" className="input w-full bg-red-800" value="Falso" readOnly />
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
          {formError && <div className="text-error text-sm mb-2">{formError}</div>}
          <button className="btn btn-secondary btn-outline" type="submit" disabled={loading}>
            <span className={loading ? 'loading' : ''}>{loading ? '' : 'Actualizar pregunta'}</span>
          </button>
        </form>
      </dialog>

      {/* Category Selector Modal */}
      <CategoryFilter
        isOpen={showCategorySelector}
        onClose={async () => {
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_update_question' + question.question_id).showModal()
            }, 100)
          }
        }}
        selectedCategories={categoryId ? [categoryId] : []}
        onCategorySelect={async (categories) => {
          setCategoryId(categories[0] || null)
          setShowCategorySelector(false)
          setEditingCategoryId(null)
          await fetchCategories()
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_update_question' + question.question_id).showModal()
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

export default UpdateQuestion
