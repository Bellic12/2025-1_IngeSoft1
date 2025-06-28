import Question from '../models/question.model'

const QuestionController = {
  getAll: async () => {
    return await Question.findAll()
  },
  create: async data => {
    return await Question.create(data)
  },
  update: async (id, data) => {
    return await Question.update(data, { where: { id_question: id } })
  },
  delete: async id => {
    return await Question.destroy({ where: { id_question: id } })
  },
}

export default QuestionController
