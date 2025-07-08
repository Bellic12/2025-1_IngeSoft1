import { useEffect, useState } from 'react'
import Question from '../components/question'
import CreateQuestion from '../components/forms/createQuestion'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const questions = await window.questionAPI.getAll()
      console.log('Fetched questions:', questions)
      setQuestions(questions)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

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
      <div className="flex flex-col items-center justify-center w-full">
        {loading && <span className="loading loading-spinner loading-xl" />}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {questions.map(question => (
              <Question
                key={question.question_id}
                question={question}
                fetchQuestions={fetchQuestions}
              />
            ))}
          </div>
        )}
      </div>
      <CreateQuestion fetchQuestions={fetchQuestions} />
    </div>
  )
}

export default Questions
