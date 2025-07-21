import { useEffect, useState } from 'react'
import { Search, Filter, Wand2 } from 'lucide-react'
import Question from '../components/question'
import CreateQuestion from '../components/forms/createQuestion'
import CategoryFilter from '../components/CategoryFilter'
import AIQuestionGenerator from '../components/aiQuestionGenerator'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const fetchQuestions = async (filters = {}) => {
    setLoading(true)
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
    } catch (err) {
      setError(err.message)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategories])

  // Initial load
  useEffect(() => {
    fetchQuestions()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Banco de Preguntas</h1>
        <p className="text-base-content/70 mt-2 text-lg">
          Gestiona y organiza tus preguntas de examen
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar preguntas..."
              className="input input-bordered w-full pl-10 bg-base-200"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter button */}
          <button className="btn btn-outline" onClick={() => setShowCategoryFilter(true)}>
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

      <div className="flex flex-col items-center justify-center w-full">
        {loading && <span className="loading loading-spinner loading-xl" />}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {questions.map(question => (
              <Question
                key={question.question_id}
                question={question}
                fetchQuestions={() =>
                  fetchQuestions({ searchTerm: searchTerm.trim(), categoryIds: selectedCategories })
                }
              />
            ))}
            {questions.length === 0 && (
              <div className="col-span-full text-center py-8 text-base-content/50">
                No se encontraron preguntas que coincidan con los filtros
              </div>
            )}
          </div>
        )}
      </div>
      <CreateQuestion
        fetchQuestions={() =>
          fetchQuestions({ searchTerm: searchTerm.trim(), categoryIds: selectedCategories })
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
            for (const question of generatedQuestions) {
              // Crear la pregunta con los campos correctos de la BD
              const newQuestion = await window.questionAPI.create({
                text: question.text,
                type: question.type,
                category_id: question.category,
                source: 'AI', // Indicar que fue generada por IA
                options: question.options.map(opt => ({
                  text: opt.text,
                  is_correct: opt.is_correct,
                })),
              })
            }

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
