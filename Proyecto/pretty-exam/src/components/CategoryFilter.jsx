import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Edit2, Plus, Check, Trash2 } from 'lucide-react'

const CategoryFilter = ({
  isOpen,
  onClose,
  selectedCategories,
  onCategorySelect,
  singleSelect = false,
  title = 'Filtrar por Categorías',
  editingCategoryId = null,
}) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [categoryQuestions, setCategoryQuestions] = useState([])
  const [deleteQuestionsToo, setDeleteQuestionsToo] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const result = await window.categoryAPI.getAll()
      setCategories(result)

      if (editingCategoryId && result.length > 0) {
        const category = result.find(c => c.category_id === editingCategoryId)
        if (category) {
          setEditingId(editingCategoryId)
          setEditingName(category.name)
        }
      }
    } catch (err) {
      // Extraer el mensaje de error específico del controlador
      let errorMessage = err.message || 'Error al cargar categorías'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      setError(errorMessage)
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()

      setTimeout(() => {
        const allDialogs = document.querySelectorAll('dialog.modal')
        const allModals = document.querySelectorAll('.modal')

        allDialogs.forEach(dialog => {
          if (!dialog.hasAttribute('data-category-filter-modal')) {
            dialog.style.zIndex = '1000'
          }
        })

        allModals.forEach(modal => {
          if (!modal.hasAttribute('data-category-filter-modal')) {
            modal.style.zIndex = '1000'
          }
        })
      }, 10)
    } else {
      setTimeout(() => {
        const allDialogs = document.querySelectorAll('dialog.modal')
        const allModals = document.querySelectorAll('.modal')

        allDialogs.forEach(dialog => {
          if (!dialog.hasAttribute('data-category-filter-modal')) {
            dialog.style.zIndex = ''
          }
        })

        allModals.forEach(modal => {
          if (!modal.hasAttribute('data-category-filter-modal')) {
            modal.style.zIndex = ''
          }
        })
      }, 10)
    }
  }, [isOpen])

  const handleCategoryToggle = categoryId => {
    if (singleSelect) {
      const newSelected = selectedCategories.includes(categoryId) ? [] : [categoryId]
      onCategorySelect(newSelected)
    } else {
      const newSelected = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]

      onCategorySelect(newSelected)
    }
  }

  const startEditing = category => {
    setEditingId(category.category_id)
    setEditingName(category.name)
    setError('')
  }

  const handleEditingNameChange = e => {
    setEditingName(e.target.value)
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const handleNewCategoryNameChange = e => {
    setNewCategoryName(e.target.value)
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const saveEdit = async () => {
    const trimmedName = editingName.trim()

    if (!trimmedName) {
      setError('El nombre no puede estar vacío')
      return
    }

    try {
      await window.categoryAPI.update(editingId, { name: trimmedName })
      await fetchCategories()
      setEditingId(null)
      setEditingName('')
      setError('')
    } catch (err) {
      // Extraer el mensaje de error específico del controlador
      let errorMessage = err.message || 'Error al actualizar categoría'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      setError(errorMessage)
      console.error(err)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setError('')
  }

  const createCategory = async () => {
    const trimmedName = newCategoryName.trim()

    if (!trimmedName) {
      setError('El nombre no puede estar vacío')
      return
    }

    try {
      await window.categoryAPI.create({ name: trimmedName })
      await fetchCategories()
      setIsCreating(false)
      setNewCategoryName('')
      setError('')
    } catch (err) {
      // Extraer el mensaje de error específico del controlador
      let errorMessage = err.message || 'Error al crear categoría'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      setError(errorMessage)
      console.error(err)
    }
  }

  const checkCategoryQuestions = async categoryId => {
    try {
      const questions = await window.questionAPI.getByCategory(categoryId)
      return questions
    } catch (err) {
      console.error('Error fetching category questions:', err)
      return []
    }
  }

  const initiateDeleteCategory = async categoryId => {
    setError('')
    const questions = await checkCategoryQuestions(categoryId)
    setDeletingCategory(categoryId)
    setCategoryQuestions(questions)
    setDeleteQuestionsToo(false)
  }

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      if (categoryQuestions.length > 0 && deleteQuestionsToo) {
        for (const question of categoryQuestions) {
          await window.questionAPI.delete(question.question_id)
        }
      } else if (categoryQuestions.length > 0) {
        for (const question of categoryQuestions) {
          await window.questionAPI.update(question.question_id, {
            category_id: null,
          })
        }
      }

      await window.categoryAPI.delete(deletingCategory)
      await fetchCategories()

      if (selectedCategories.includes(deletingCategory)) {
        onCategorySelect(selectedCategories.filter(id => id !== deletingCategory))
      }

      setDeletingCategory(null)
      setCategoryQuestions([])
      setDeleteQuestionsToo(false)
    } catch (err) {
      // Extraer el mensaje de error específico del controlador
      let errorMessage = err.message || 'Error desconocido'

      // Si el error viene del IPC de Electron, extraer solo el mensaje real
      if (errorMessage.includes('Error invoking remote method')) {
        const match = errorMessage.match(/Error: (.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }

      setError('Error al eliminar categoría: ' + errorMessage)
      console.error(err)
    }
  }

  const cancelDeleteCategory = () => {
    setDeletingCategory(null)
    setCategoryQuestions([])
    setDeleteQuestionsToo(false)
  }

  if (!isOpen) return null

  const modalElement = (
    <div
      className="modal modal-open"
      data-category-filter-modal="true"
      style={{
        zIndex: 9999999,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        className="modal-box w-full max-w-md max-h-[80vh] flex flex-col"
        style={{
          zIndex: 10000000,
          position: 'relative',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-2 alert alert-error">
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
              onClick={() => setError('')}
              className="btn btn-sm btn-ghost btn-square"
              title="Cerrar mensaje de error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Categories list */}
              {categories.map(category => (
                <div
                  key={category.category_id}
                  className="flex items-center gap-2 p-2 hover:bg-base-200 rounded"
                >
                  {/* Checkbox or Radio */}
                  <input
                    type={singleSelect ? 'radio' : 'checkbox'}
                    name={singleSelect ? 'category-select' : undefined}
                    className={singleSelect ? 'radio radio-primary' : 'checkbox checkbox-primary'}
                    checked={selectedCategories.includes(category.category_id)}
                    onChange={() => handleCategoryToggle(category.category_id)}
                  />

                  {/* Category name */}
                  {editingId === category.category_id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={handleEditingNameChange}
                        className={`input input-sm input-bordered flex-1 ${error ? 'input-error' : ''}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="btn btn-ghost btn-sm btn-square text-success"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit} className="btn btn-ghost btn-sm btn-square">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{category.name}</span>
                      <button
                        onClick={() => startEditing(category)}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => initiateDeleteCategory(category.category_id)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Create new category */}
              {isCreating ? (
                <div className="flex items-center gap-2 p-2 border border-primary rounded">
                  <Plus className="w-4 h-4 text-primary" />
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={handleNewCategoryNameChange}
                    placeholder="Nombre de la nueva categoría"
                    className={`input input-sm input-bordered flex-1 ${error ? 'input-error' : ''}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') createCategory()
                      if (e.key === 'Escape') {
                        setIsCreating(false)
                        setNewCategoryName('')
                        setError('')
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={createCategory}
                    className="btn btn-ghost btn-sm btn-square text-success"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewCategoryName('')
                      setError('')
                    }}
                    className="btn btn-ghost btn-sm btn-square"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 p-2 w-full text-left hover:bg-base-200 rounded border-2 border-dashed border-base-300 text-base-content/70"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Crear nueva categoría</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-200 flex justify-between items-center">
          <div className="text-sm text-base-content/70">
            {singleSelect
              ? selectedCategories.length > 0
                ? `Categoría seleccionada: ${categories.find(c => c.category_id === selectedCategories[0])?.name || ''}`
                : 'Ninguna categoría seleccionada'
              : `${selectedCategories.length} categoría(s) seleccionada(s)`}
          </div>
          <div className="flex gap-2">
            {!singleSelect && (
              <button onClick={() => onCategorySelect([])} className="btn btn-ghost btn-sm">
                Limpiar filtros
              </button>
            )}
            <button onClick={onClose} className="btn btn-primary btn-sm">
              {singleSelect ? 'Seleccionar' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" style={{ zIndex: 9999998 }}>
        <button onClick={onClose}>close</button>
      </form>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="modal modal-open" style={{ zIndex: 10000001 }}>
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Eliminar Categoría</h3>
            <div className="py-4">
              {categoryQuestions.length > 0 ? (
                <div className="space-y-4">
                  <p>
                    Esta categoría tiene <strong>{categoryQuestions.length}</strong> pregunta(s)
                    asociada(s).
                  </p>
                  <div className="alert alert-warning">
                    <div className="flex flex-col gap-2">
                      <span>¿Qué deseas hacer con las preguntas?</span>
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-error"
                          checked={deleteQuestionsToo}
                          onChange={e => setDeleteQuestionsToo(e.target.checked)}
                        />
                        <span className="label-text">
                          Eliminar también las {categoryQuestions.length} pregunta(s)
                        </span>
                      </label>
                      {!deleteQuestionsToo && (
                        <div className="text-sm opacity-70 ml-7">
                          Las preguntas se mantendrán sin categoría
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p>¿Estás seguro de que deseas eliminar esta categoría?</p>
              )}
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={cancelDeleteCategory}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={confirmDeleteCategory}>
                {categoryQuestions.length > 0 && deleteQuestionsToo
                  ? `Eliminar categoría y ${categoryQuestions.length} pregunta(s)`
                  : 'Eliminar categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(modalElement, document.body)
}

export default CategoryFilter
