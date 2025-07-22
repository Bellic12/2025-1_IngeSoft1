import { useEffect, useState, useRef } from 'react'
import { X, Plus, Sparkles, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import CreateQuestion from '../../questions/forms/createQuestion'
import AIQuestionGenerator from '../../ai/components/aiQuestionGenerator'
import CategoryFilter from '../../categories/components/CategoryFilter'

const AddQuestionsModal = ({ examId, onClose, onQuestionsAdded }) => {
  const [allQuestions, setAllQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showCreateQuestion, setShowCreateQuestion] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [examData, setExamData] = useState(null)
  const searchInputRef = useRef(null)

  const fetchAllQuestions = async (filters = {}) => {
    try {
      let questions
      // If no filters, get all questions
      if (!filters.searchTerm && (!filters.categoryIds || filters.categoryIds.length === 0)) {
        questions = await window.questionAPI.getAll()
      } else {
        // Use search API with filters
        questions = await window.questionAPI.search({
          searchTerm: filters.searchTerm,
          categoryIds: filters.categoryIds,
        })
      }
      setAllQuestions(questions)
      setFilteredQuestions(questions)
    } catch (err) {
      toast.error('Error al cargar las preguntas')
      setAllQuestions([])
      setFilteredQuestions([])
    }
  }

  const fetchExamQuestions = async () => {
    try {
      const questions = await window.examAPI.getQuestions(examId)
      // Preseleccionar las preguntas que ya están en el examen
      setSelectedQuestions(questions)
    } catch (err) {
      console.error('Error al cargar preguntas del examen:', err)
      setSelectedQuestions([])
    }
  }

  const fetchExamData = async () => {
    try {
      const exam = await window.examAPI.getById(examId)
      setExamData(exam)
    } catch (err) {
      console.error('Error al cargar datos del examen:', err)
      setExamData(null)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchAllQuestions(), fetchExamQuestions(), fetchExamData()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Debounced search function
  const performSearch = async () => {
    const filters = {
      searchTerm: searchTerm.trim(),
      categoryIds: selectedCategories,
    }
    await fetchAllQuestions(filters)
  }

  // Effect for search term and category changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategories])

  // Filter questions based on type (local filter)
  useEffect(() => {
    let filtered = allQuestions

    if (selectedType) {
      filtered = filtered.filter(question => question.type === selectedType)
    }

    setFilteredQuestions(filtered)
  }, [allQuestions, selectedType])

  const handleQuestionSelect = question => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.question_id === question.question_id)
      if (isSelected) {
        return prev.filter(q => q.question_id !== question.question_id)
      } else {
        return [...prev, question]
      }
    })
  }

  const handleAddSelectedQuestions = async () => {
    try {
      // Obtener las preguntas que ya están en el examen
      const currentExamQuestions = await window.examAPI.getQuestions(examId)
      const currentQuestionIds = currentExamQuestions.map(q => q.question_id)

      // Separar las preguntas seleccionadas entre las que hay que agregar y las que hay que quitar
      const selectedQuestionIds = selectedQuestions.map(q => q.question_id)
      const questionsToAdd = selectedQuestionIds.filter(id => !currentQuestionIds.includes(id))
      const questionsToRemove = currentQuestionIds.filter(id => !selectedQuestionIds.includes(id))

      // Agregar nuevas preguntas
      if (questionsToAdd.length > 0) {
        await window.examAPI.addQuestions(examId, questionsToAdd)
      }

      // Remover preguntas deseleccionadas
      if (questionsToRemove.length > 0) {
        await window.examAPI.removeQuestions(examId, questionsToRemove)
      }

      const totalChanges = questionsToAdd.length + questionsToRemove.length
      if (totalChanges > 0) {
        toast.success(
          `${questionsToAdd.length} pregunta(s) añadida(s), ${questionsToRemove.length} pregunta(s) removida(s)`
        )
      } else {
        toast.info('No se realizaron cambios')
      }

      onQuestionsAdded()
      onClose()
    } catch (error) {
      toast.error('Error al actualizar preguntas del examen')
    }
  }

  const handleQuestionCreated = () => {
    setShowCreateQuestion(false)
    // Refresh the questions list with current filters
    fetchAllQuestions({
      searchTerm: searchTerm.trim(),
      categoryIds: selectedCategories,
    })
  }

  const handleOpenAIGenerator = () => {
    setShowAIGenerator(true)
  }

  const handleCloseAIGenerator = () => {
    setShowAIGenerator(false)
  }

  const handleQuestionsGeneratedByAI = async () => {
    // Refrescar la lista de preguntas después de que se generen con IA
    await fetchAllQuestions({
      searchTerm: searchTerm.trim(),
      categoryIds: selectedCategories,
    })
    await fetchExamQuestions() // También refrescar las preguntas del examen
    setShowAIGenerator(false)
    // Notificar al componente padre que se agregaron preguntas
    onQuestionsAdded()
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-5xl max-h-[90vh] bg-base-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gestionar Preguntas del Examen</h2>
          <button className="btn btn-ghost btn-circle" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and filters */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <label className="input flex-1">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="search"
                className="grow"
                placeholder="Buscar preguntas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                ref={searchInputRef}
              />
              <kbd className="kbd kbd-sm">Ctrl</kbd>
              <kbd className="kbd kbd-sm">K</kbd>
            </label>

            {/* Type filter dropdown */}
            <select
              className="select select-bordered w-full lg:w-48"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="multiple_choice">Opción múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
            </select>

            {/* Category filter button */}
            <button
              className="btn btn-outline border-gray-600 w-full lg:w-auto"
              onClick={() => setShowCategoryFilter(true)}
            >
              <Filter className="w-4 h-4" />
              Filtrar por Categoría
              {selectedCategories.length > 0 && (
                <span className="badge badge-primary badge-sm ml-2">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredQuestions.map(question => (
                <div
                  key={question.question_id}
                  className={`card border-2 cursor-pointer transition-all ${
                    selectedQuestions.some(q => q.question_id === question.question_id)
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-base-400'
                  }`}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <div className="card-body p-4">
                    <h3 className="font-semibold text-sm">{question.text}</h3>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <span className="badge badge-outline badge-xs">
                        {question.type === 'multiple_choice'
                          ? 'Opción múltiple'
                          : 'Verdadero/Falso'}
                      </span>
                      <span className="badge badge-outline badge-xs">
                        {typeof question.category === 'object'
                          ? question.category?.name || 'General'
                          : question.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-base-300">
          <div className="flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={() => setShowCreateQuestion(true)}>
              <Plus className="w-4 h-4" />
              Crear Pregunta
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleOpenAIGenerator}>
              <Sparkles className="w-4 h-4" />
              Generar con IA
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-base-content/60">
              {selectedQuestions.length} pregunta(s) seleccionada(s)
            </span>
            <button className="btn btn-primary" onClick={handleAddSelectedQuestions}>
              Actualizar Preguntas
            </button>
          </div>
        </div>
      </div>

      {/* Create Question Modal */}
      {showCreateQuestion && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-2xl bg-base-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Crear Nueva Pregunta</h3>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => setShowCreateQuestion(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreateQuestion
              fetchQuestions={handleQuestionCreated}
              onClose={() => setShowCreateQuestion(false)}
            />
          </div>
        </div>
      )}

      {/* AI Question Generator Modal */}
      {showAIGenerator && examData && (
        <AIQuestionGenerator
          isOpen={showAIGenerator}
          onClose={handleCloseAIGenerator}
          onQuestionsGenerated={handleQuestionsGeneratedByAI}
          examId={examId}
          examData={examData}
        />
      )}

      {/* Category Filter Modal */}
      <CategoryFilter
        isOpen={showCategoryFilter}
        onClose={() => setShowCategoryFilter(false)}
        selectedCategories={selectedCategories}
        onCategorySelect={setSelectedCategories}
      />
    </div>
  )
}

export default AddQuestionsModal
