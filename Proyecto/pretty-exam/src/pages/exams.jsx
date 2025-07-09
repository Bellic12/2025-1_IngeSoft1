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
      console.log('Fetched exams:', exams)
      setExams(exams)
      setFilteredExams(exams)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Function to normalize text by removing accents and special characters
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
    <div className="flex flex-col p-4 max-h-screen overflow-hidden">
      {/* Header with search and filter - Fixed */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold">Exámenes</h1>

        <div className="flex gap-4 w-full sm:w-auto">
          {/* Search bar */}
          <label className="input flex-1 sm:w-80">
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

      {/* Content - Scrollable with calculated height */}
      <div style={{ height: 'calc(100vh - 200px)' }} className="overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-xl" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="error">Error: {error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
            <div className="flex flex-col gap-4 pb-20">
              {filteredExams.map(exam => (
                <Exam key={exam.exam_id} exam={exam} fetchExams={fetchExams} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating create button */}
      <CreateExam fetchExams={fetchExams} />
    </div>
  )
}

export default Exams
