import { useEffect, useState, useRef } from 'react'
import Exam from '../components/exam'
import CreateExam from '../components/forms/createExam'

const Exams = () => {
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef(null)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const exams = await window.examAPI.getAll()
      setExams(exams)
      setFilteredExams(exams)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const normalizeText = text => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // Filter exams based on search term
  useEffect(() => {
    let filtered = exams

    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm)
      filtered = filtered.filter(
        exam =>
          normalizeText(exam.name || '').includes(normalizedSearchTerm) ||
          normalizeText(exam.description || '').includes(normalizedSearchTerm)
      )
    }

    setFilteredExams(filtered)
  }, [exams, searchTerm])

  useEffect(() => {
    fetchExams()
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

  return (
    <div className="flex flex-col gap-4">
      {/* Header with search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Exámenes</h1>
          <p className="text-base-content/70 text-lg mt-2">
            Arma tus exámenes o hazlos tú mismo a modo de práctica
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          {/* Search bar */}
          <label className="input flex-1 sm:w-100">
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
              placeholder="Buscar exámenes por título o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              ref={searchInputRef}
            />
            <kbd className="kbd kbd-sm">Ctrl</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 w-full">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-xl" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-8">
            <p className="error">Error: {error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {filteredExams.map(exam => (
              <Exam key={exam.exam_id} exam={exam} fetchExams={fetchExams} />
            ))}
          </>
        )}
      </div>

      {/* Floating create button */}
      <CreateExam fetchExams={fetchExams} />
    </div>
  )
}

export default Exams
