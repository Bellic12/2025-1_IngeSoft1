import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Edit2, Plus, Check, Trash2 } from 'lucide-react'

const CategoryFilter = ({ isOpen, onClose, selectedCategories, onCategorySelect, singleSelect = false, title = "Filtrar por Categorías", editingCategoryId = null }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const result = await window.categoryAPI.getAll()
      setCategories(result)
      
      // Auto-start editing if editingCategoryId is provided and categories just loaded
      if (editingCategoryId && result.length > 0) {
        const category = result.find(c => c.category_id === editingCategoryId)
        if (category) {
          setEditingId(editingCategoryId)
          setEditingName(category.name)
        }
      }
    } catch (err) {
      setError('Error al cargar categorías')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      console.log('CategoryFilter opening...')
      fetchCategories()
      
      // Force all existing modals to lower z-index
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
        
        console.log('Z-index adjustments applied')
      }, 10)
    } else {
      console.log('CategoryFilter closing...')
      // Reset z-index when closing
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

  // Handle category selection
  const handleCategoryToggle = (categoryId) => {
    if (singleSelect) {
      // Single selection mode - only one category can be selected
      const newSelected = selectedCategories.includes(categoryId) ? [] : [categoryId]
      onCategorySelect(newSelected)
    } else {
      // Multiple selection mode - original behavior
      const newSelected = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
      
      onCategorySelect(newSelected)
    }
  }

  // Start editing category
  const startEditing = (category) => {
    setEditingId(category.category_id)
    setEditingName(category.name)
    setError('')
  }

  // Save edited category
  const saveEdit = async () => {
    if (!editingName.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    try {
      await window.categoryAPI.update(editingId, { name: editingName.trim() })
      await fetchCategories()
      setEditingId(null)
      setEditingName('')
      setError('')
    } catch (err) {
      setError('Error al actualizar categoría')
      console.error(err)
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setError('')
  }

  // Create new category
  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    try {
      await window.categoryAPI.create({ name: newCategoryName.trim() })
      await fetchCategories()
      setIsCreating(false)
      setNewCategoryName('')
      setError('')
    } catch (err) {
      setError('Error al crear categoría')
      console.error(err)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    try {
      await window.categoryAPI.delete(categoryId)
      await fetchCategories()
      // Remove from selected if it was selected
      if (selectedCategories.includes(categoryId)) {
        onCategorySelect(selectedCategories.filter(id => id !== categoryId))
      }
    } catch (err) {
      setError('Error al eliminar categoría. Puede que tenga preguntas asociadas.')
      console.error(err)
    }
  }

  if (!isOpen) return null

  // Use createPortal to render above any existing modal with a very high z-index
  const modalElement = (
    <div 
      className="modal modal-open"
      data-category-filter-modal="true"
      style={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div 
        className="modal-box w-full max-w-md max-h-[80vh] flex flex-col"
        style={{
          zIndex: 1000000,
          position: 'relative'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-2 alert alert-error">
            <span className="text-sm">{error}</span>
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
              {categories.map((category) => (
                <div key={category.category_id} className="flex items-center gap-2 p-2 hover:bg-base-200 rounded">
                  {/* Checkbox or Radio */}
                  <input
                    type={singleSelect ? "radio" : "checkbox"}
                    name={singleSelect ? "category-select" : undefined}
                    className={singleSelect ? "radio radio-primary" : "checkbox checkbox-primary"}
                    checked={selectedCategories.includes(category.category_id)}
                    onChange={() => handleCategoryToggle(category.category_id)}
                  />
                  
                  {/* Category name */}
                  {editingId === category.category_id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input input-sm input-bordered flex-1"
                        onKeyDown={(e) => {
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
                      <button
                        onClick={cancelEdit}
                        className="btn btn-ghost btn-sm btn-square"
                      >
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
                        onClick={() => deleteCategory(category.category_id)}
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
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre de la nueva categoría"
                    className="input input-sm input-bordered flex-1"
                    onKeyDown={(e) => {
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
              : `${selectedCategories.length} categoría(s) seleccionada(s)`
            }
          </div>
          <div className="flex gap-2">
            {!singleSelect && (
              <button
                onClick={() => onCategorySelect([])}
                className="btn btn-ghost btn-sm"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm"
            >
              {singleSelect ? 'Seleccionar' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  )

  console.log('Rendering CategoryFilter modal with createPortal...')
  return createPortal(modalElement, document.body)
}

export default CategoryFilter
