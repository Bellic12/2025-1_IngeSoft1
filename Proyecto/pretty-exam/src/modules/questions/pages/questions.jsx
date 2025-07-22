import { useEffect, useState, useRef } from 'react'
import { Filter, Wand2 } from 'lucide-react'
import Question from '../components/question'
import CreateQuestionModal from '../forms/createQuestionModal'
import CategoryFilter from '../../categories/components/CategoryFilter'
import AIQuestionGenerator from '../../ai/components/aiQuestionGenerator'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const searchInputRef = useRef(null)
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const fetchQuestions = async (filters = {}) => {
    setLoading(true)
    setError(null)
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
      setQuestions(questions)
      setFilteredQuestions(questions)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError(`Error al buscar preguntas: ${err.message}`)
      // Don't break the UI, show empty results instead
      setQuestions([])
      setFilteredQuestions([])
    }
    setLoading(false)
  }

  // Debounced search function
  const performSearch = async () => {
    const filters = {
      searchTerm: searchTerm.trim(),
      categoryIds: selectedCategories,
    }
    await fetchQuestions(filters)
  }

  // Effect for search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategories])

  // Initial load
  useEffect(() => {
    fetchQuestions()
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

  // Filter questions based on type (local filter)
  useEffect(() => {
    let filtered = questions

    if (selectedType) {
      filtered = filtered.filter(question => question.type === selectedType)
    }

    setFilteredQuestions(filtered)
  }, [questions, selectedType])

  return (
    <div className="flex flex-col gap-4">
      {/* Header with search - Fixed */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Banco de Preguntas</h1>
          <p className="text-base-content/70 text-lg mt-2">
            Crea, edita y elimina tus preguntas cuando lo necesites
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          {/* Search bar */}
          <label className="input flex-1 sm:w-96">
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

          {/* Filter button */}
          <button
            className="btn btn-outline border-gray-600 "
            onClick={() => setShowCategoryFilter(true)}
          >
            <Filter className="w-4 h-4" />
            Filtrar por Categoría
            {selectedCategories.length > 0 && (
              <span className="badge badge-primary badge-sm ml-2">{selectedCategories.length}</span>
            )}
          </button>

          {/* AI Generator button */}
          <button className="btn btn-primary" onClick={() => setShowAIGenerator(true)}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generar con IA
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center w-full">
        {loading && <span className="loading loading-spinner loading-xl" />}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {filteredQuestions.map(question => (
              <Question
                key={question.question_id}
                question={question}
                fetchQuestions={() =>
                  fetchQuestions({
                    searchTerm: searchTerm.trim(),
                    categoryIds: selectedCategories,
                  })
                }
              />
            ))}
            {filteredQuestions.length === 0 && (
              <div className="col-span-full text-center py-8 text-base-content/50">
                No se encontraron preguntas que coincidan con los filtros
              </div>
            )}
          </div>
        )}
      </div>

      <CreateQuestionModal
        fetchQuestions={() =>
          fetchQuestions({
            searchTerm: searchTerm.trim(),
            categoryIds: selectedCategories,
          })
        }
      />

      {/* Category Filter Modal */}
      <CategoryFilter
        isOpen={showCategoryFilter}
        onClose={() => setShowCategoryFilter(false)}
        selectedCategories={selectedCategories}
        onCategorySelect={setSelectedCategories}
      />

      {/* AI Question Generator Modal */}
      <AIQuestionGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onQuestionsGenerated={async generatedQuestions => {
          try {
            // Las preguntas ya fueron guardadas en aiQuestionGenerator
            // Solo necesitamos actualizar la lista de preguntas
            console.log('Preguntas recibidas desde AI Generator:', generatedQuestions.length)

            // Actualizar la lista de preguntas
            fetchQuestions({
              searchTerm: searchTerm.trim(),
              categoryIds: selectedCategories,
            })
          } catch (error) {
            setError(error.message)
          }
        }}
      />
    </div>
  )
}

export default Questions
