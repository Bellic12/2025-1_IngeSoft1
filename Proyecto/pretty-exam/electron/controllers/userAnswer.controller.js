import { UserAnswer, Option } from '../models/index'

const UserAnswerController = {
  getAll: async () => {
    return await UserAnswer.findAll({ include: ['result', 'question', 'option'] })
  },
  getById: async (resultId, questionId) => {
    return await UserAnswer.findOne({
      where: { result_id: resultId, question_id: questionId },
      include: ['result', 'question', 'option'],
    })
  },
  create: async data => {
    // Verificar si la opción es correcta
    const option = await Option.findByPk(data.optionId)
    if (!option) throw new Error('Option not found')
    const isCorrect = !!option.is_correct
    return await UserAnswer.create({
      result_id: data.resultId,
      question_id: data.questionId,
      option_id: data.optionId,
      is_correct: isCorrect,
    })
  },
  delete: async (resultId, questionId) => {
    return await UserAnswer.destroy({ where: { result_id: resultId, question_id: questionId } })
  },
}

export default UserAnswerController
