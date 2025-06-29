import sequelize from '../config/database'
import { Question, Option, Category } from '../models/index'

const QuestionController = {
  // Get questions with options and category
  getAll: async () => {
    const questions = await Question.findAll({
      include: [
        { model: Option, as: 'options' },
        { model: Category, as: 'category' },
      ],
    })
    return questions.map(q => q.get({ plain: true }))
  },

  // Create a new question with options
  create: async data => {
    const t = await sequelize.transaction()
    try {
      const question = await Question.create(
        {
          text: data.text,
          type: data.type,
          category_id: data.category_id,
        },
        { transaction: t }
      )

      for (const opt of data.options) {
        await Option.create(
          {
            text: opt.text,
            is_correct: opt.is_correct,
            question_id: question.question_id,
          },
          { transaction: t }
        )
      }

      await t.commit()
      return question
    } catch (err) {
      await t.rollback()
      throw err
    }
  },

  // Update an existing question and its options
  update: async (id, data) => {
    const t = await sequelize.transaction()
    try {
      await Question.update(
        {
          text: data.text,
          type: data.type,
          category_id: data.category_id,
        },
        { where: { question_id: id }, transaction: t }
      )

      const currentOptions = await Option.findAll({
        where: { question_id: id },
        transaction: t,
      })

      for (const opt of data.options) {
        if (opt.option_id) {
          await Option.update(
            {
              text: opt.text,
              is_correct: opt.is_correct,
            },
            { where: { option_id: opt.option_id }, transaction: t }
          )
        } else {
          await Option.create(
            {
              text: opt.text,
              is_correct: opt.is_correct,
              question_id: id,
            },
            { transaction: t }
          )
        }
      }

      const receivedIds = data.options.filter(o => o.option_id).map(o => o.option_id)
      for (const opt of currentOptions) {
        if (!receivedIds.includes(opt.option_id)) {
          await Option.destroy({ where: { option_id: opt.option_id }, transaction: t })
        }
      }

      await t.commit()
      return true
    } catch (err) {
      await t.rollback()
      throw err
    }
  },

  delete: async id => {
    return await Question.destroy({ where: { question_id: id } })
  },
}

export default QuestionController
