import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

const ExamTimer = ({ timeLimit, onTimeUp, onFiveMinuteWarning, onOneMinuteWarning }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [warningShown, setWarningShown] = useState({ fiveMin: false, oneMin: false })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1

        if (newTime === 300 && !warningShown.fiveMin) {
          onFiveMinuteWarning()
          setWarningShown(prev => ({ ...prev, fiveMin: true }))
        }

        if (newTime === 60 && !warningShown.oneMin) {
          onOneMinuteWarning()
          setWarningShown(prev => ({ ...prev, oneMin: true }))
        }

        if (newTime <= 0) {
          onTimeUp()
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onTimeUp, onFiveMinuteWarning, onOneMinuteWarning, warningShown])

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-error'
    if (timeLeft <= 300) return 'text-warning'
    return 'text-base-content'
  }

  const getProgressValue = () => {
    return ((timeLimit * 60 - timeLeft) / (timeLimit * 60)) * 100
  }

  return (
    <div className="flex items-center gap-3 bg-base-100 p-3 rounded-lg shadow-sm">
      <Clock className={`w-5 h-5 ${getTimerColor()}`} />
      <div className="flex flex-col">
        <span className={`font-mono text-lg font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
        <progress
          className={`progress w-24 h-2 ${timeLeft <= 300 ? 'progress-error' : 'progress-primary'}`}
          value={getProgressValue()}
          max="100"
        />
      </div>
      {timeLeft <= 300 && <AlertTriangle className="w-4 h-4 text-warning animate-pulse" />}
    </div>
  )
}

export default ExamTimer
