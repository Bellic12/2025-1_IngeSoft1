import sequelize from '../config/database'
import { Question, Option, Category } from '../models/index'
import { Op } from 'sequelize'
import {
  validateQuestion,
  validateQuestionUpdate,
  validateQuestionId,
} from '../validations/question.validation.js'

const QuestionController = {
  getAll: async () => {
    const questions = await Question.findAll({
      include: [
        { model: Option, as: 'options' },
        { model: Category, as: 'category' },
      ],
    })
    return questions.map(q => q.get({ plain: true }))
  },

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

  create: async data => {
    // Validar datos de entrada
    const validation = validateQuestion(data)
    if (!validation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = validation.errors
      throw error
    }

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

      // Si es un error de validación, reenviarlo
      if (err.message === 'VALIDATION_ERROR') {
        throw err
      }

      throw err
    }
  },

  update: async (id, data) => {
    // Validar ID
    const idValidation = validateQuestionId(id)
    if (!idValidation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = idValidation.errors
      throw error
    }

    // Validar datos de actualización
    const validation = validateQuestionUpdate(data)
    if (!validation.isValid) {
      const error = new Error('VALIDATION_ERROR')
      error.fields = validation.errors
      throw error
    }

    const t = await sequelize.transaction()
    try {
      if (data.category_id) {
        const categoryExists = await Category.findByPk(data.category_id, { transaction: t })
        if (!categoryExists) {
          await t.rollback()
          console.error(`Category with ID ${data.category_id} does not exist`)
          throw new Error('CATEGORY_NOT_FOUND')
        }
      }

      const existingQuestion = await Question.findByPk(id, { transaction: t })
      if (!existingQuestion) {
        await t.rollback()
        console.error(`Question with ID ${id} does not exist`)
        throw new Error('QUESTION_NOT_FOUND')
      }

      await sequelize.query('PRAGMA foreign_keys = OFF', {
        transaction: t,
        type: sequelize.QueryTypes.RAW,
      })

      const existingOptions = await sequelize.query(
        'SELECT option_id FROM `Option` WHERE `question_id` = ?',
        {
          replacements: [id],
          transaction: t,
          type: sequelize.QueryTypes.SELECT,
        }
      )

      if (existingOptions.length > 0) {
        const optionIds = existingOptions.map(opt => opt.option_id)
        await sequelize.query(
          `DELETE FROM \`UserAnswer\` WHERE \`option_id\` IN (${optionIds.map(() => '?').join(',')})`,
          {
            replacements: optionIds,
            transaction: t,
            type: sequelize.QueryTypes.DELETE,
          }
        )
      }

      await sequelize.query('DELETE FROM `Option` WHERE `question_id` = ?', {
        replacements: [id],
        transaction: t,
        type: sequelize.QueryTypes.DELETE,
      })

      await Question.update(
        {
          text: data.text,
          type: data.type,
          category_id: data.category_id,
        },
        { where: { question_id: id }, transaction: t }
      )

      if (data.options && data.options.length > 0) {
        for (const opt of data.options) {
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

      await sequelize.query('PRAGMA foreign_keys = ON', {
        transaction: t,
        type: sequelize.QueryTypes.RAW,
      })

      await t.commit()
      return true
    } catch (err) {
      await t.rollback()
      console.error('Error updating question:', err)

      // Si es un error de validación, reenviarlo
      if (err.message === 'VALIDATION_ERROR') {
        throw err
      }

      if (err.name === 'SequelizeForeignKeyConstraintError') {
        console.error('Foreign key constraint error details:', {
          sql: err.sql,
          original: err.original?.message,
          table: err.table,
          fields: err.fields,
        })
      }

      if (err.message === 'CATEGORY_NOT_FOUND') {
        throw new Error('CATEGORY_NOT_FOUND')
      }
      if (err.message === 'QUESTION_NOT_FOUND') {
        throw new Error('QUESTION_NOT_FOUND')
      }

      throw new Error('UPDATE_FAILED')
    }
  },

  delete: async id => {
    return await Question.destroy({ where: { question_id: id } })
  },

  search: async (filters = {}) => {
    const { searchTerm, categoryIds } = filters

    const normalizeSearchTerm = text => {
      if (!text || typeof text !== 'string') {
        return ''
      }
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    }

    try {
      let whereClause = {}

      if (categoryIds && categoryIds.length > 0) {
        whereClause.category_id = {
          [Op.in]: categoryIds,
        }
      }

      if (searchTerm && searchTerm.trim()) {
        const normalizedSearchTerm = normalizeSearchTerm(searchTerm)
        const searchConditions = []

        searchConditions.push({
          text: sequelize.where(
            sequelize.fn(
              'LOWER',
              sequelize.fn(
                'REPLACE',
                sequelize.fn(
                  'REPLACE',
                  sequelize.fn(
                    'REPLACE',
                    sequelize.fn(
                      'REPLACE',
                      sequelize.fn('REPLACE', sequelize.col('Question.text'), 'á', 'a'),
                      'é',
                      'e'
                    ),
                    'í',
                    'i'
                  ),
                  'ó',
                  'o'
                ),
                'ú',
                'u'
              )
            ),
            'LIKE',
            `%${normalizedSearchTerm}%`
          ),
        })

        if (!categoryIds || categoryIds.length === 0) {
          searchConditions.push(
            sequelize.where(
              sequelize.fn(
                'LOWER',
                sequelize.fn(
                  'REPLACE',
                  sequelize.fn(
                    'REPLACE',
                    sequelize.fn(
                      'REPLACE',
                      sequelize.fn(
                        'REPLACE',
                        sequelize.fn('REPLACE', sequelize.col('category.name'), 'á', 'a'),
                        'é',
                        'e'
                      ),
                      'í',
                      'i'
                    ),
                    'ó',
                    'o'
                  ),
                  'ú',
                  'u'
                )
              ),
              'LIKE',
              `%${normalizedSearchTerm}%`
            )
          )
        }

        const searchClause = { [Op.or]: searchConditions }

        if (Object.keys(whereClause).length > 0) {
          whereClause = {
            [Op.and]: [whereClause, searchClause],
          }
        } else {
          whereClause = searchClause
        }
      }

      const questions = await Question.findAll({
        where: whereClause,
        include: [
          { model: Option, as: 'options' },
          { model: Category, as: 'category' },
        ],
        order: [['question_id', 'DESC']],
      })

      return questions.map(q => q.get({ plain: true }))
    } catch (error) {
      console.error('Error in question search:', error)
      return []
    }
  },

  getByCategory: async categoryId => {
    const questions = await Question.findAll({
      where: { category_id: categoryId },
      include: [
        { model: Option, as: 'options' },
        { model: Category, as: 'category' },
      ],
      order: [['question_id', 'DESC']],
    })
    return questions.map(q => q.get({ plain: true }))
  },
}

export default QuestionController
