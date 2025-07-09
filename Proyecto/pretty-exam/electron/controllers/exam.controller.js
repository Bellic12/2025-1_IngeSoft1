import sequelize from '../config/database'
import { Exam, Question, Category, Option } from '../models/index'

const ExamController = {
  // Get all exams with associated questions
  getAll: async () => {
    const exams = await Exam.findAll({
      include: [{ model: Question, as: 'questions' }],
    })
    return exams.map(e => e.get({ plain: true }))
  },

  // Get an exam by ID with associated questions
  getById: async id => {
    const exam = await Exam.findByPk(id, {
      include: [{ model: Question, as: 'questions' }],
    })
    return exam ? exam.get({ plain: true }) : null
  },

  // Create a new exam with associated questions
  create: async data => {
    const t = await sequelize.transaction()
    try {
      const exam = await Exam.create(
        {
          name: data.name,
          description: data.description,
          duration_minutes: data.duration_minutes,
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
          duration_minutes: data.duration_minutes,
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

  // Get questions associated with an exam
  getQuestions: async examId => {
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            { model: Category, as: 'category' },
            { model: Option, as: 'options' },
          ],
        },
      ],
    })
    return exam ? exam.questions.map(q => q.get({ plain: true })) : []
  },

  // Add questions to an exam
  addQuestions: async (examId, questionIds) => {
    const t = await sequelize.transaction()
    try {
      const exam = await Exam.findByPk(examId, { transaction: t })
      if (!exam) throw new Error('Exam not found')

      const questions = await Question.findAll({
        where: { question_id: questionIds },
        transaction: t,
      })

      await exam.addQuestions(questions, { transaction: t })
      await t.commit()
      return { message: 'Questions added successfully' }
    } catch (err) {
      await t.rollback()
      throw err
    }
  },

  // Remove questions from an exam
  removeQuestions: async (examId, questionIds) => {
    const t = await sequelize.transaction()
    try {
      const exam = await Exam.findByPk(examId, { transaction: t })
      if (!exam) throw new Error('Exam not found')

      const questions = await Question.findAll({
        where: { question_id: questionIds },
        transaction: t,
      })

      await exam.removeQuestions(questions, { transaction: t })
      await t.commit()
      return { message: 'Questions removed successfully' }
    } catch (err) {
      await t.rollback()
      throw err
    }
  },
}

export default ExamController
