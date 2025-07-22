import sequelize from '../config/database'
import { Exam, Question, Category, Option } from '../models/index'
import { validateExam, validateExamUpdate, validateExamId } from '../validations/exam.validation.js'

const ExamController = {
  // Get all exams with associated questions
  getAll: async () => {
    const exams = await Exam.findAll({
      include: [{ model: Question, as: 'questions' }],
    })
    return exams.map(e => e.get({ plain: true }))
  },

  // Get an exam by ID with associated questions and their options
  getById: async id => {
    const exam = await Exam.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [{ model: Option, as: 'options' }],
        },
      ],
    })
    return exam ? exam.get({ plain: true }) : null
  },

  // Create a new exam with associated questions
  create: async data => {
    try {
      // Validar los datos del examen
      const validation = validateExam(data)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const t = await sequelize.transaction()
      try {
        const exam = await Exam.create(
          {
            name: data.name.trim(),
            description: data.description ? data.description.trim() : null,
            duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
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
    } catch (err) {
      console.error('ExamController: Error creando examen:', err)
      throw err
    }
  },

  // Update an existing exam and its associated questions
  update: async (id, data) => {
    try {
      // Validar el ID del examen
      const idValidation = validateExamId(id)
      if (!idValidation.isValid) {
        throw new Error(idValidation.errors.join(', '))
      }

      // Validar los datos de actualización
      const updateValidation = validateExamUpdate(data)
      if (!updateValidation.isValid) {
        throw new Error(updateValidation.errors.join(', '))
      }

      const t = await sequelize.transaction()
      try {
        // Verificar que el examen existe
        const existingExam = await Exam.findByPk(id, { transaction: t })
        if (!existingExam) {
          throw new Error('El examen no existe')
        }

        await Exam.update(
          {
            name: data.name ? data.name.trim() : existingExam.name,
            description:
              data.description !== undefined
                ? data.description
                  ? data.description.trim()
                  : null
                : existingExam.description,
            duration_minutes:
              data.duration_minutes !== undefined
                ? data.duration_minutes
                  ? parseInt(data.duration_minutes)
                  : null
                : existingExam.duration_minutes,
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
    } catch (err) {
      console.error('ExamController: Error actualizando examen:', err)
      throw err
    }
  },

  // Delete an exam by ID
  delete: async id => {
    try {
      // Validar el ID del examen
      const idValidation = validateExamId(id)
      if (!idValidation.isValid) {
        throw new Error(idValidation.errors.join(', '))
      }

      const t = await sequelize.transaction()
      try {
        const result = await Exam.destroy({
          where: { exam_id: id },
          transaction: t,
        })
        
        if (result === 0) {
          throw new Error('El examen no existe')
        }
        
        await t.commit()
        return { message: 'Exam deleted successfully' }
      } catch (err) {
        await t.rollback()
        throw err
      }
    } catch (err) {
      console.error('ExamController: Error eliminando examen:', err)
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
