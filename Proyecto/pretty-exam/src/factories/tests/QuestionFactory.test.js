import QuestionFactory from '../QuestionFactory.js'

describe('QuestionFactory', () => {
  describe('createQuestion', () => {
    test('debería crear una pregunta de selección múltiple', () => {
      const questionData = {
        text: '¿Cuál es la capital de Francia?',
        category_id: 1,
        options: [
          { text: 'Madrid', is_correct: false },
          { text: 'París', is_correct: true },
          { text: 'Londres', is_correct: false },
          { text: 'Roma', is_correct: false },
        ],
      }

      const question = QuestionFactory.createQuestion('multiple_choice', questionData)

      expect(question.constructor.name).toBe('MultipleChoiceQuestion')
      expect(question.text).toBe('¿Cuál es la capital de Francia?')
      expect(question.options).toHaveLength(4)
    })

    test('debería crear una pregunta verdadero/falso', () => {
      const questionData = {
        text: '¿París es la capital de Francia?',
        category_id: 1,
        options: [
          { text: 'Verdadero', is_correct: true },
          { text: 'Falso', is_correct: false },
        ],
      }

      const question = QuestionFactory.createQuestion('true_false', questionData)

      expect(question.constructor.name).toBe('TrueFalseQuestion')
      expect(question.text).toBe('¿París es la capital de Francia?')
      expect(question.options).toHaveLength(2)
    })

    test('debería lanzar error para tipo no válido', () => {
      const questionData = {
        text: 'Pregunta',
        category_id: 1,
        options: [],
      }

      expect(() => {
        QuestionFactory.createQuestion('invalid', questionData)
      }).toThrow('Unknown question type: invalid')
    })
  })

  describe('MultipleChoiceQuestion', () => {
    const multipleChoiceData = {
      text: '¿Cuál es 2+2?',
      category_id: 1,
      options: [
        { text: '3', is_correct: false },
        { text: '4', is_correct: true },
        { text: '5', is_correct: false },
      ],
    }

    test('validate debería pasar con datos válidos', () => {
      const question = QuestionFactory.createQuestion('multiple_choice', multipleChoiceData)
      expect(question.validate()).toBe(true)
    })

    test('validate debería fallar sin opciones', () => {
      const invalidData = { ...multipleChoiceData, options: [] }
      const question = QuestionFactory.createQuestion('multiple_choice', invalidData)
      expect(() => question.validate()).toThrow('At least 2 options required')
    })

    test('validate debería fallar con menos de 2 opciones', () => {
      const invalidData = {
        ...multipleChoiceData,
        options: [{ text: 'Una opción', is_correct: true }],
      }
      const question = QuestionFactory.createQuestion('multiple_choice', invalidData)
      expect(() => question.validate()).toThrow('At least 2 options required')
    })

    test('validate debería fallar sin respuesta correcta', () => {
      const invalidData = {
        ...multipleChoiceData,
        options: [
          { text: 'A', is_correct: false },
          { text: 'B', is_correct: false },
        ],
      }
      const question = QuestionFactory.createQuestion('multiple_choice', invalidData)
      expect(() => question.validate()).toThrow('At least one correct option required')
    })

    test('toAPIFormat debería retornar formato correcto', () => {
      const question = QuestionFactory.createQuestion('multiple_choice', multipleChoiceData)
      const apiFormat = question.toAPIFormat()

      expect(apiFormat).toHaveProperty('text')
      expect(apiFormat).toHaveProperty('category_id')
      expect(apiFormat).toHaveProperty('options')
      expect(apiFormat.text).toBe('¿Cuál es 2+2?')
      expect(apiFormat.options).toHaveLength(3)
    })
  })

  describe('TrueFalseQuestion', () => {
    const trueFalseData = {
      text: '¿2+2=4?',
      category_id: 1,
      options: [
        { text: 'Verdadero', is_correct: true },
        { text: 'Falso', is_correct: false },
      ],
    }

    test('validate debería pasar con datos válidos', () => {
      const question = QuestionFactory.createQuestion('true_false', trueFalseData)
      expect(question.validate()).toBe(true)
    })

    test('validate debería fallar sin respuesta correcta', () => {
      const invalidData = {
        ...trueFalseData,
        options: [
          { text: 'Verdadero', is_correct: false },
          { text: 'Falso', is_correct: false },
        ],
      }
      const question = QuestionFactory.createQuestion('true_false', invalidData)
      expect(() => question.validate()).toThrow('Must select True or False')
    })

    test('toAPIFormat debería retornar formato correcto', () => {
      const question = QuestionFactory.createQuestion('true_false', trueFalseData)
      const apiFormat = question.toAPIFormat()

      expect(apiFormat).toHaveProperty('text')
      expect(apiFormat).toHaveProperty('category_id')
      expect(apiFormat).toHaveProperty('options')
      expect(apiFormat.text).toBe('¿2+2=4?')
      expect(apiFormat.options).toHaveLength(2)
    })
  })
})
