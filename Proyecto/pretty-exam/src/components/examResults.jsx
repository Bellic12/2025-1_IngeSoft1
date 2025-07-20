import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useExamSim } from './examSimContext'
import { CheckCircle, XCircle, Award, BarChart3, Home, Sparkles } from 'lucide-react'
import ExplainQuestion from './explainQuestion'

const ExamResults = () => {
  const {
    exam,
    questions,
    userAnswers,
    timeSpent,
    backToMenu,
    correctAnswers,
    incorrectAnswers,
    scorePercentage,
  } = useExamSim()
  const { id } = useParams()
  const [feedbackExplanation, setFeedbackExplanation] = useState('')

  const handleOpenFeedbackCollapse = async () => {
    if (feedbackExplanation !== '') return
    try {
      const response = await window.aiAPI.feedbackExam(exam.exam_id, id)
      setFeedbackExplanation(response)
    } catch (error) {
      setFeedbackExplanation('No se pudo obtener la retroalimentación.')
    }
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        No hay resultados para mostrar.
        <button onClick={backToMenu} className="btn btn-primary mt-4">
          Volver al Menú Principal
        </button>
      </div>
    )
  }

  const getAnswerStatus = question => {
    const userAnswer = userAnswers[question.question_id]
    const correctOption = question.options.find(opt => opt.is_correct)
    const correctAnswer = correctOption ? correctOption.option_id : null
    const wasAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== ''
    const isCorrect = wasAnswered && userAnswer === correctAnswer

    return {
      userAnswer: wasAnswered ? userAnswer : null,
      isCorrect,
      wasAnswered,
      correctAnswer,
    }
  }

  const getOptionClassName = (question, optionId) => {
    const { userAnswer, isCorrect, correctAnswer } = getAnswerStatus(question)

    if (optionId === correctAnswer) {
      return 'bg-success/20 border-success text-white'
    } else if (optionId === userAnswer && !isCorrect) {
      return 'bg-error/20 border-error text-white'
    }

    return 'bg-base-200 border-base-300 text-base-content'
  }

  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-success'
    if (scorePercentage >= 60) return 'text-warning'
    return 'text-error'
  }

  const getCategoryName = category => {
    if (typeof category === 'object' && category !== null && 'name' in category) {
      return category.name
    }
    return category
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Header de resultados */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <Award className={`w-16 h-16 mx-auto mb-4 ${getScoreColor()}`} />
            <h1 className="text-3xl font-bold mb-2">Resultados del Examen</h1>
            <h2 className="text-xl text-base-content/70">{exam.name}</h2>
          </div>

          {/* Resumen de resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-figure text-primary">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="stat-title">Puntaje</div>
              <div className={`stat-value ${getScoreColor()}`}>
                {correctAnswers}/{questions.length}
              </div>
              <div className="stat-desc">{scorePercentage}%</div>
            </div>

            <div className="stat bg-base-200 rounded-box">
              <div className="stat-figure text-success">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Aciertos</div>
              <div className="stat-value text-success">{correctAnswers}</div>
            </div>

            <div className="stat bg-base-200 rounded-box">
              <div className="stat-figure text-error">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Desaciertos</div>
              <div className="stat-value text-error">{incorrectAnswers}</div>
            </div>

            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Tiempo</div>
              <div className="stat-value text-info">{timeSpent}min</div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Puntuación obtenida</span>
              <span>
                {correctAnswers} de {questions.length} puntos
              </span>
            </div>
            <progress
              className={`progress w-full ${scorePercentage >= 60 ? 'progress-success' : 'progress-error'}`}
              value={scorePercentage}
              max="100"
            />
          </div>
        </div>

        {/* Feedback AI debajo del puntaje, arriba de las preguntas */}
        <div className="mb-8">
          <div
            className="bg-base-100 border-base-300 collapse collapse-arrow border"
            onClick={handleOpenFeedbackCollapse}
          >
            <input type="checkbox" className="peer" />
            <div className="flex collapse-title font-bold bg-base-100 text-primary-content border-x border-t border-base-200 gap-2">
              Retroalimentación General AI
              <Sparkles />
            </div>
            <div className="collapse-content bg-base-100 text-primary-content border-x border-b border-base-200">
              {feedbackExplanation === '' ? (
                <div className="flex flex-col gap-2">
                  <div className="skeleton h-4 w-10/12"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-11/12"></div>
                </div>
              ) : (
                <div
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: feedbackExplanation }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Revisión detallada */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Revisión Detallada</h2>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const status = getAnswerStatus(question)

              return (
                <div key={question.question_id} className="bg-base-100 rounded-lg shadow-lg p-6">
                  {/* Header de la pregunta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-outline badge-lg">Pregunta {index + 1}</span>
                      {status.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-error" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-base-content/70">
                        {status.isCorrect ? 1 : 0} / 1 puntos
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">{question.text}</h3>

                  <div className="flex gap-2 mb-4">
                    <span className="badge bg-purple-600 text-white">
                      {getCategoryName(question.category)}
                    </span>
                    <span
                      className={`badge ${question.type === 'multiple_choice' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                      {question.type === 'multiple_choice'
                        ? 'Selección múltiple'
                        : 'Verdadero/Falso'}
                    </span>
                  </div>

                  {/* Opciones de respuesta */}
                  <div className="space-y-3">
                    {question.options.map(option => (
                      <div
                        key={option.option_id}
                        className={`flex items-center p-4 rounded-lg border-2 ${getOptionClassName(question, option.option_id)}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {option.option_id === status.correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          {option.option_id === status.userAnswer &&
                            option.option_id !== status.correctAnswer && (
                              <XCircle className="w-5 h-5 text-error" />
                            )}
                          <span className="font-medium">{option.text}</span>
                        </div>

                        <div className="flex gap-2">
                          {option.option_id === status.correctAnswer && (
                            <span className="badge badge-success badge-sm">Correcta</span>
                          )}
                          {option.option_id === status.userAnswer && (
                            <span className="badge badge-info badge-sm">Tu respuesta</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón Explicar */}
                  <div className="mt-4 flex">
                    <ExplainQuestion
                      questionId={question.question_id}
                      optionSelectedId={status.userAnswer}
                    />
                  </div>

                  {!status.wasAnswered && (
                    <div className="mt-4 p-3 bg-warning/20 border border-warning rounded-lg">
                      <span className="text-warning font-medium">No respondida</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Botón para volver */}
        <div className="text-center">
          <button onClick={backToMenu} className="btn btn-primary btn-lg">
            <Home className="w-5 h-5 mr-2" />
            Volver al Menú Principal
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamResults
