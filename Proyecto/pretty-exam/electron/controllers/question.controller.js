import sequelize from '../config/database'
import { Question, Option, Category } from '../models/index'
import { Op } from 'sequelize'

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

  // Get a question by ID with options and category
  getById: async id => {
    const question = await Question.findOne({
      where: { question_id: id },
      include: [
        { model: Option, as: 'options' },
        { model: Category, as: 'category' },
      ],
    })
    if (!question) {
      throw new Error(`Question with ID ${id} not found`)
    }
    return question.get({ plain: true })
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

  // Delete a question by ID
  delete: async id => {
    return await Question.destroy({ where: { question_id: id } })
  },

  // Search questions with filters
  search: async (filters = {}) => {
    console.log('QuestionController.search called with filters:', filters)
    const { searchTerm, categoryIds } = filters
    let whereClause = {}

    // Build where clause for categories
    if (categoryIds && categoryIds.length > 0) {
      whereClause.category_id = {
        [Op.in]: categoryIds
      }
      console.log('Added category filter:', whereClause.category_id)
    }

    // Build search conditions
    let searchConditions = []
    
    if (searchTerm && searchTerm.trim()) {
      searchConditions = [
        // Search in question text
        { text: { [Op.iLike]: `%${searchTerm.trim()}%` } },
        // Search in category name
        { '$category.name$': { [Op.iLike]: `%${searchTerm.trim()}%` } }
      ]
      console.log('Added search conditions for term:', searchTerm.trim())
    }

    // Combine conditions
    if (searchConditions.length > 0) {
      if (Object.keys(whereClause).length > 0) {
        // If we have category filter, combine with AND
        whereClause = {
          [Op.and]: [
            whereClause,
            { [Op.or]: searchConditions }
          ]
        }
      } else {
        // If no category filter, just use search conditions
        whereClause = {
          [Op.or]: searchConditions
        }
      }
    }

    console.log('Final where clause:', JSON.stringify(whereClause, null, 2))

    const questions = await Question.findAll({
      where: whereClause,
      include: [
        { model: Option, as: 'options' },
        { model: Category, as: 'category' },
      ],
      order: [['question_id', 'DESC']] // Most recent first
    })

    console.log(`Found ${questions.length} questions`)
    return questions.map(q => q.get({ plain: true }))
  },
}

export default QuestionController
