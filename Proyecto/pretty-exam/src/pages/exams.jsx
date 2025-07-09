import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Exam from '../components/exam'
import CreateExam from '../components/forms/createExam'

const Exams = () => {
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Filter exams based on search term only
  useEffect(() => {
    let filtered = exams

    if (searchTerm) {
      filtered = filtered.filter(
        exam =>
          exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredExams(filtered)
  }, [exams, searchTerm])

  useEffect(() => {
    fetchExams()
  }, [])

  return (
    <div className="flex flex-col p-4 max-h-screen overflow-hidden">
      {/* Header with search - Fixed */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold">Exámenes</h1>
        
        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar exámenes por título o descripción..."
            className="input input-bordered w-full pl-10 bg-base-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
