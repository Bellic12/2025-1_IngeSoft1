import Question from '../models/question.model'

const QuestionController = {
  getAll: async () => {
    return await Question.findAll()
  },
   async data => {
    return await Question.create(data)
  },
  update: create:async (id, data) => {
    return await Question.update(data, { where: { id_question: id } })
  },
  delete: async id => {
    return await Question.destroy({ where: { id_question: id } })
  },
}

export default QuestionController
