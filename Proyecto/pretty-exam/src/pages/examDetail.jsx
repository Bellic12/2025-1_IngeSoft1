import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Play, ArrowLeft, History, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import Question from '../components/question'
import AddQuestionsModal from '../components/forms/addQuestionsModal'
import CategoryFilter from '../components/CategoryFilter'

const ExamDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddQuestions, setShowAddQuestions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const searchInputRef = useRef(null)

  const fetchExam = async () => {
    try {
      const examData = await window.examAPI.getById(id)
      setExam(examData)
    } catch (err) {
      setError(err.message)
      toast.error('Error al cargar el examen')
    }
  }

  const fetchExamQuestions = async (filters = {}) => {
    try {
      let questionsData = await window.examAPI.getQuestions(id)

      // Apply search and category filters if they exist
      if (filters.searchTerm || (filters.categoryIds && filters.categoryIds.length > 0)) {
        // Filter by search term
        if (filters.searchTerm) {
          const normalizedSearchTerm = normalizeText(filters.searchTerm)
          questionsData = questionsData.filter(question =>
            normalizeText(question.text || '').includes(normalizedSearchTerm)
          )
        }

        // Filter by categories
        if (filters.categoryIds && filters.categoryIds.length > 0) {
          questionsData = questionsData.filter(question => {
            const questionCategoryId =
              typeof question.category === 'object'
                ? question.category?.category_id
                : question.category_id
            return filters.categoryIds.includes(questionCategoryId)
          })
        }
      }

      setAllQuestions(questionsData)
      setFilteredQuestions(questionsData)
    } catch (err) {
      console.error('Error al cargar preguntas del examen:', err)
      setAllQuestions([])
      setFilteredQuestions([])
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchExam(), fetchExamQuestions()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

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
    await fetchExamQuestions(filters)
  }

  // Effect for search term and category changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedCategories.length > 0) {
        performSearch()
      } else {
        fetchExamQuestions()
      }
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

  // Normalize text for search
  const normalizeText = text => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const handleStartSimulation = () => {
    navigate(`/exam/${id}/simulacion`)
  }

  const handleAddQuestions = () => {
    setShowAddQuestions(true)
  }

  const handleGoHistory = () => {
    navigate(`/exam/${id}/history`)
  }

  const handleGoBack = () => {
    navigate('/exams')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-xl" />
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-error">Error: {error || 'Examen no encontrado'}</p>
        <button className="btn btn-primary" onClick={handleGoBack}>
          Volver a exámenes
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-circle" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">{exam.name}</h1>
        </div>

        {/* Exam info */}
        <div className="bg-base-200 p-4 rounded-lg">
          <p className="text-base-content/70 mb-2">{exam.description}</p>
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span>Duración: {exam.duration_minutes || exam.duration || 'N/A'} minutos</span>
            <span>Preguntas: {allQuestions.length}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button className="btn btn-success" onClick={handleStartSimulation}>
            <Play className="w-4 h-4" />
            Iniciar Simulación
          </button>
          <button className="btn btn-primary" onClick={handleAddQuestions}>
            <Plus className="w-4 h-4" />
            Gestionar Preguntas
          </button>
          <button className="btn btn-warning" onClick={handleGoHistory}>
            <History className="w-4 h-4" />
            Historial de resultados
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
              className="btn btn-outline w-full lg:w-auto"
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
      </div>

      {/* Questions section */}
      <div className="overflow-y-scroll">
        <h2 className="text-xl font-semibold mb-4">Preguntas del Examen</h2>
        {filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-base-content/60 mb-4">
              {allQuestions.length === 0
                ? 'Este examen no tiene preguntas asignadas'
                : 'No se encontraron preguntas que coincidan con los filtros'}
            </p>
            <button className="btn btn-primary" onClick={handleAddQuestions}>
              <Plus className="w-4 h-4" />
              {allQuestions.length === 0 ? 'Añadir Primera Pregunta' : 'Gestionar Preguntas'}
            </button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {filteredQuestions.map(question => (
                <Question
                  key={question.question_id}
                  question={question}
                  fetchQuestions={() =>
                    fetchExamQuestions({
                      searchTerm: searchTerm.trim(),
                      categoryIds: selectedCategories,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Questions Modal */}
      {showAddQuestions && (
        <AddQuestionsModal
          examId={id}
          onClose={() => setShowAddQuestions(false)}
          onQuestionsAdded={() =>
            fetchExamQuestions({
              searchTerm: searchTerm.trim(),
              categoryIds: selectedCategories,
            })
          }
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

export default ExamDetail
