import { Sparkles } from 'lucide-react'
import { useState } from 'react'

const ExplainQuestion = ({ questionId, optionSelectedId }) => {
  const [explanation, setExplanation] = useState('')

  const handleOpenCollapse = async () => {
    if (explanation !== '') return
    try {
      const response = await window.aiAPI.explainQuestion(questionId, optionSelectedId)
      setExplanation(response)
    } catch (error) {
      console.error('Error fetching explanation:', error)
      setExplanation('No se pudo obtener la explicación.')
    }
  }

  return (
    <div
      className="bg-base-100 border-base-300 collapse collapse-arrow border"
      onClick={handleOpenCollapse}
    >
      <input type="checkbox" className="peer" />
      <div className="flex collapse-title font-bold bg-base-100 text-primary-content border-x border-t border-base-200 gap-2">
        Explicación
        <Sparkles />
      </div>
      <div className="collapse-content bg-base-100 text-primary-content border-x border-b border-base-200">
        {explanation === '' ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-10/12"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-11/12"></div>
          </div>
        ) : (
          <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: explanation }} />
        )}
      </div>
    </div>
  )
}

export default ExplainQuestion
