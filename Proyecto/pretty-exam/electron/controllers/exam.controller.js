import sequelize from '../config/database'
import { Exam, Question } from '../models/index'

const ExamController = {
  // Get all exams with associated questions
  getAll: async () => {
    const exams = await Exam.findAll({
      include: [{ model: Question, as: 'questions' }],
    })
    return exams.map(e => e.get({ plain: true }))
  },

  // Create a new exam with associated questions
  create: async data => {
    const t = await sequelize.transaction()
    try {
      const exam = await Exam.create(
        {
          name: data.name,
          description: data.description,
          duration: data.duration,
        },
        { transaction: t }
      )

      if (data.question_ids && data.question_ids.length > 0) {
        await exam.setQuestions(data.question_ids, { transaction: t })
      }

      await t.commit()
      return exam
    } catch (err) {
      await t.rollback()
      throw err
    }
  },

  // Update an existing exam and its associated questions
  update: async (id, data) => {
    const t = await sequelize.transaction()
    try {
      await Exam.update(
        {
          name: data.name,
          description: data.description,
          duration: data.duration,
        },
        { where: { exam_id: id }, transaction: t }
      )

      if (data.question_ids && data.question_ids.length > 0) {
        const exam = await Exam.findByPk(id, { transaction: t })
        await exam.setQuestions(data.question_ids, { transaction: t })
      }

      await t.commit()
      return { message: 'Exam updated successfully' }
    } catch (err) {
      await t.rollback()
      throw err
    }
  },

  // Delete an exam by ID
  delete: async id => {
    const t = await sequelize.transaction()
    try {
      const result = await Exam.destroy({
        where: { exam_id: id },
        transaction: t,
      })
      await t.commit()
      return result > 0 ? { message: 'Exam deleted successfully' } : null
    } catch (err) {
      await t.rollback()
      throw err
    }
  },
}

export default ExamController
