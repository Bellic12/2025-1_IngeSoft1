import { useState, useEffect } from 'react'
import { Edit2, Tag } from 'lucide-react'
import CategoryFilter from '../CategoryFilter'

const EditAIQuestion = ({ question, onSave, onCancel, categories }) => {
  const [text, setText] = useState('')
  const [type, setType] = useState('multiple_choice')
  const [options, setOptions] = useState([])
  // La categoría de la IA puede no existir en la base
  const [categoryName, setCategoryName] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [formError, setFormError] = useState('')
  const [modalWasOpen, setModalWasOpen] = useState(false)
  const [allCategories, setAllCategories] = useState([]) // Categorías reales de la BD

  // Initialize form when modal opens
  const initializeForm = () => {
    setText(question.text || '')
    setType(question.type || 'multiple_choice')
    setOptions(
      question.options?.map(opt =>
        typeof opt === 'object'
          ? { text: opt.text, isCorrect: opt.is_correct ?? opt.isCorrect }
          : { text: opt, isCorrect: false }
      ) || []
    )
    setCategoryName(question.category || '')
    setCategoryId(null)
    setFormError('')
  }

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const result = await window.categoryAPI.getAll()
      setAllCategories(result)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleOpenModal = async () => {
    initializeForm()
    await fetchCategories()
    document.getElementById('modal_edit_ai_question_' + question.id).showModal()
  }

  const handleCloseModal = e => {
    if (e) e.preventDefault()
    document.getElementById('modal_edit_ai_question_' + question.id).close()
  }

  useEffect(() => {
    // Si la categoría generada por IA existe en la base, seleccionarla
    if (categories && categoryName) {
      const found = categories.find(c => c.name === categoryName)
      setCategoryId(found ? found.category_id : null)
    }
  }, [categories, categoryName])

  const handleOnChangeType = event => {
    setType(event.target.value)
    if (event.target.value === 'true_false') {
      setOptions([
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: false },
      ])
    } else {
      setOptions(options.length > 0 ? options : [{ text: '', isCorrect: false }])
    }
  }

  const handleOnSelectOption = (e, index) => {
    if (type === 'multiple_choice') {
      const newOptions = [...options]
      newOptions[index].isCorrect = e.target.checked
      setOptions(newOptions)
    } else {
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

  const handleSubmit = e => {
    e.preventDefault()
    setFormError('')
    if (!text.trim()) {
      setFormError('La pregunta no puede estar vacía.')
      return
    }
    if (type === 'multiple_choice' && options.length < 2) {
      setFormError('Debe haber al menos dos opciones.')
      return
    }
    if (type === 'multiple_choice' && !options.some(opt => opt.isCorrect)) {
      setFormError('Debes marcar al menos una opción como correcta.')
      return
    }
    if (type === 'true_false' && !options.some(opt => opt.isCorrect)) {
      setFormError('Debes marcar la respuesta correcta.')
      return
    }
    // Enviar la categoría como nombre si no existe en la base
    const updatedQuestion = {
      ...question,
      text,
      type,
      options: options.map(opt => ({
        text: opt.text,
        is_correct: opt.isCorrect,
        isCorrect: opt.isCorrect, // Mantener ambos formatos para compatibilidad
      })),
      // Para preguntas true_false, también actualizar correctAnswer
      correctAnswer:
        type === 'true_false'
          ? !!options.find(opt => opt.text === 'Verdadero')?.isCorrect
          : question.correctAnswer,
      category: categoryId
        ? categories.find(c => c.category_id === categoryId)?.name
        : categoryName,
      category_id: categoryId,
    }

    onSave(updatedQuestion)
    handleCloseModal()
  }

  console.log('EditAIQuestion render', { question, categories })
  return (
    <>
      <button className="btn btn-outline btn-primary btn-square btn-sm" onClick={handleOpenModal}>
        <Edit2 className="w-4 h-4" />
      </button>
      <dialog id={'modal_edit_ai_question_' + question.id} className="modal">
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
          <h3 className="font-bold text-lg text-left">Editar pregunta</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    document.getElementById('modal_edit_ai_question_' + question.id).close()
                    setTimeout(() => setShowCategorySelector(true), 100)
                  }}
                >
                  <Tag className="w-4 h-4" />
                  {categoryId
                    ? allCategories.find(c => c.category_id === categoryId)?.name ||
                      categories.find(c => c.category_id === categoryId)?.name ||
                      'Categoría seleccionada'
                    : categoryName || 'Sin categoría'}
                </button>
                {(categoryId || categoryName) && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-square"
                    onClick={() => {
                      setCategoryId(null)
                      setCategoryName('')
                    }}
                    title="Limpiar categoría"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
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
                    name={`true_false_option_${question.id}`}
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
                    name={`true_false_option_${question.id}`}
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
          {formError && <div className="text-error text-sm mt-2">{formError}</div>}
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button className="btn btn-secondary btn-outline" type="submit">
              Actualizar pregunta
            </button>
          </div>
        </form>
      </dialog>

      {/* Category Selector Modal */}
      <CategoryFilter
        isOpen={showCategorySelector}
        onClose={async () => {
          setShowCategorySelector(false)
          await fetchCategories() // Refrescar categorías al cerrar
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_edit_ai_question_' + question.id).showModal()
            }, 100)
          }
        }}
        selectedCategories={categoryId ? [categoryId] : []}
        onCategorySelect={async selectedCategoryIds => {
          const selectedCategoryId = selectedCategoryIds[0] || null
          setCategoryId(selectedCategoryId)

          // Actualizar también el nombre de la categoría
          if (selectedCategoryId) {
            // Buscar primero en las categorías reales de la BD
            const selectedCategory =
              allCategories.find(c => c.category_id === selectedCategoryId) ||
              categories.find(c => c.category_id === selectedCategoryId)
            if (selectedCategory) {
              setCategoryName(selectedCategory.name)
            }
          } else {
            setCategoryName('')
          }

          setShowCategorySelector(false)
          await fetchCategories() // Refrescar categorías después de seleccionar
          if (modalWasOpen) {
            setModalWasOpen(false)
            setTimeout(() => {
              document.getElementById('modal_edit_ai_question_' + question.id).showModal()
            }, 100)
          }
        }}
        singleSelect={true}
        title="Seleccionar Categoría"
      />
    </>
  )
}

export default EditAIQuestion
