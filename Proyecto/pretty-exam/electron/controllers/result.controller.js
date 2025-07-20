import { Result, Exam, UserAnswer, Option } from '../models/index'

const ResultController = {
  getAll: async () => {
    const results = await Result.findAll({
      include: [
        { model: Exam, as: 'exam' },
        { model: UserAnswer, as: 'userAnswers', include: [{ model: Option, as: 'option' }] },
      ],
    })
    return results.map(e => e.get({ plain: true }))
  },

  getByExamId: async examId => {
    const results = await Result.findAll({
      where: { exam_id: examId },
      order: [['taken_at', 'DESC']],
    })
    return results.map(e => e.get({ plain: true }))
  },

  getById: async id => {
    const result = await Result.findByPk(id, {
      include: [
        { model: Exam, as: 'exam' },
        { model: UserAnswer, as: 'userAnswers', include: [{ model: Option, as: 'option' }] },
      ],
    })
    return result ? result.get({ plain: true }) : null
  },

  create: async data => {
    const result = await Result.create({
      exam_id: data.exam_id,
      score: data.score,
      correct_answers: data.correct_answers,
      incorrect_answers: data.incorrect_answers,
      time_used: data.time_used,
      taken_at: new Date(),
    })
    return result.get({ plain: true })
  },
  delete: async id => {
    return await Result.destroy({ where: { result_id: id } })
  },
}

export default ResultController
