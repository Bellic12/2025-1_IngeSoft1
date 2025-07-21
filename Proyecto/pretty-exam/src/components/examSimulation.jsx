import { useState, useEffect } from 'react'
import { useExamSim } from './examSimContext'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react'
import QuestionDisplay from './QuestionDisplay'
import ExamTimer from './ExamTimer'
import { toast } from 'react-toastify'

const ExamSimulation = () => {
  const { id } = useParams()
  const {
    exam,
    setExam,
    questions,
    setQuestions,
    userAnswers,
    setUserAnswers,
    setTimeSpent,
    finishExam,
    backToMenu,
  } = useExamSim()
  const navigate = useNavigate()
  const [loadingExam, setLoadingExam] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [savingResult, setSavingResult] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  useEffect(() => {
    const fetchData = async () => {
      setLoadingExam(true)
      await fetchExam()
      await fetchExamQuestions()
      setLoadingExam(false)
    }
    fetchData()
  }, [])

  const fetchExam = async () => {
    try {
      const examData = await window.examAPI.getById(id)
      setExam(examData)
    } catch (err) {
      toast.error('Error al cargar el examen')
    }
  }

  const fetchExamQuestions = async () => {
    try {
      const questionsData = await window.examAPI.getQuestions(id)
      setQuestions(questionsData)
    } catch (err) {
      console.error('Error al cargar preguntas del examen:', err)
      setQuestions([])
    }
  }

  const handleAnswerSelect = answerId => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: answerId,
    }))
  }

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleFinishExam = async () => {
    setSavingResult(true)
    const spent = Math.floor((Date.now() - startTime) / 1000 / 60)
    setTimeSpent(spent)
    let correct = 0
    let incorrect = 0
    questions.forEach(q => {
      const userAns = userAnswers[q.question_id]
      const correctOpt = q.options?.find(opt => opt.is_correct)
      if (userAns && correctOpt && userAns === correctOpt.option_id) {
        correct++
      } else {
        incorrect++
      }
    })
    const percentage = Math.round((correct / questions.length) * 100)
    let resultId = null
    let result = null
    try {
      result = await window.resultAPI.create({
        exam_id: exam.exam_id,
        score: percentage,
        correct_answers: correct,
        incorrect_answers: incorrect,
        time_used: spent,
      })
      resultId = result.result_id
    } catch (err) {
      toast.error('Error al guardar el resultado del examen')
      setSavingResult(false)
      return
    }
    // Guardar respuestas del usuario con el resultId correcto
    const userAnswerPromises = []
    questions.forEach(q => {
      const userAns = userAnswers[q.question_id]
      if (userAns) {
        userAnswerPromises.push(
          window.userAnswerAPI.create({
            resultId,
            questionId: q.question_id,
            optionId: userAns,
          })
        )
      }
    })
    try {
      await Promise.all(userAnswerPromises)
    } catch (err) {
      toast.error('Error al guardar las respuestas del usuario')
    }
    finishExam(spent, correct, incorrect, percentage)
    setSavingResult(false)
    toast.success('Resultado guardado correctamente')
    navigate(`/resultados/${resultId}`)
  }

  const handleTimeUp = () => {
    const spent = exam.timeLimit || 0
    setTimeSpent(spent)
    finishExam({ ...userAnswers }, spent)
    navigate('/resultados')
  }

  const handleFiveMinuteWarning = () => {
    const modal = document.getElementById('five-minute-warning')
    modal?.showModal()
  }

  const handleOneMinuteWarning = () => {
    const modal = document.getElementById('one-minute-warning')
    modal?.showModal()
  }

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length
  }

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Carga del examen */}
      {loadingExam ? (
        <div className="flex items-center justify-center h-screen">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="container mx-auto p-4 lg:p-8">
          {/* Header del examen */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{exam.name}</h1>
                <p className="text-base-content/70">{exam.description}</p>
              </div>

              <div className="flex items-center gap-4">
                {exam.duration_minutes && (
                  <ExamTimer
                    timeLimit={exam.duration_minutes}
                    onTimeUp={handleTimeUp}
                    onFiveMinuteWarning={handleFiveMinuteWarning}
                    onOneMinuteWarning={handleOneMinuteWarning}
                  />
                )}

                <button onClick={backToMenu} className="btn btn-ghost btn-sm">
                  Salir
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-base-content/70 mb-2">
                <span>Progreso del examen</span>
                <span>
                  {getAnsweredCount()} de {questions.length} respondidas
                </span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={getProgressPercentage()}
                max="100"
              />
            </div>
          </div>

          {/* Pregunta actual */}
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[currentQuestion.question_id] || null}
            onAnswerSelect={handleAnswerSelect}
          />

          {/* Controles de navegación */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={isFirstQuestion}
              className="btn btn-outline"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </button>

            <div className="flex gap-2">
              <button onClick={() => setShowFinishConfirm(true)} className="btn btn-warning">
                <Flag className="w-4 h-4 mr-2" />
                Finalizar Examen
              </button>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={isLastQuestion}
              className="btn btn-primary"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para finalizar */}
      {showFinishConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">¿Finalizar examen?</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas finalizar el examen? Has respondido {getAnsweredCount()}{' '}
              de {questions.length} preguntas.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowFinishConfirm(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-warning"
                onClick={handleFinishExam}
                disabled={savingResult}
              >
                {savingResult ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
                Finalizar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Modal de alerta 5 minutos */}
      <dialog id="five-minute-warning" className="modal">
        <div className="modal-box">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-warning" />
            <h3 className="font-bold text-lg">¡Atención!</h3>
          </div>
          <p>Quedan 5 minutos para que termine el examen.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary">Entendido</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Modal de alerta 1 minuto */}
      <dialog id="one-minute-warning" className="modal">
        <div className="modal-box">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-error" />
            <h3 className="font-bold text-lg">¡Último minuto!</h3>
          </div>
          <p>Queda 1 minuto para que termine el examen.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error">Entendido</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ExamSimulation
