import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// --- Contexto global para simulación ---
const ExamSimContext = createContext()

export const useExamSim = () => useContext(ExamSimContext)

export function ExamSimProvider({ children }) {
  const [userAnswers, setUserAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)
  const [scorePercentage, setScorePercentage] = useState(0)
  const navigate = useNavigate()

  const finishExam = (timeSpentMinutes, correct, incorrect, percentage) => {
    setTimeSpent(timeSpentMinutes)
    setCorrectAnswers(correct)
    setIncorrectAnswers(incorrect)
    setScorePercentage(percentage)
    navigate('/resultados')
  }

  const backToMenu = () => {
    setUserAnswers({})
    setTimeSpent(0)
    navigate('/exams')
  }

  return (
    <ExamSimContext.Provider
      value={{
        exam,
        setExam,
        questions,
        setQuestions,
        userAnswers,
        timeSpent,
        setUserAnswers,
        setTimeSpent,
        correctAnswers,
        setCorrectAnswers,
        incorrectAnswers,
        setIncorrectAnswers,
        scorePercentage,
        setScorePercentage,
        finishExam,
        backToMenu,
      }}
    >
      {children}
    </ExamSimContext.Provider>
  )
}
