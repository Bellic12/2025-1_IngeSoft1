/**
 * Tests para validaciones de Question
 */

import {
  validateQuestion,
  validateOptions,
  validateQuestionUpdate,
  validateQuestionId,
} from '../question.validation.js'

describe('validateQuestion', () => {
  test('debería validar pregunta válida de opción múltiple', () => {
    const validQuestion = {
      text: 'Esta es una pregunta de prueba con suficientes caracteres',
      type: 'multiple_choice',
      category_id: 1,
      options: [
        { text: 'Opción A', isCorrect: true },
        { text: 'Opción B', isCorrect: false },
      ],
    }

    const result = validateQuestion(validQuestion)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería validar pregunta válida de verdadero/falso', () => {
    const validQuestion = {
      text: 'Esta es una pregunta de verdadero o falso',
      type: 'true_false',
      category_id: null,
      options: [
        { text: 'Verdadero', isCorrect: true },
        { text: 'Falso', isCorrect: false },
      ],
    }

    const result = validateQuestion(validQuestion)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería fallar con datos nulos', () => {
    const result = validateQuestion(null)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Los datos de la pregunta son requeridos')
  })

  test('debería fallar con texto vacío', () => {
    const invalidQuestion = {
      text: '',
      type: 'multiple_choice',
      options: [{ text: 'Opción A', isCorrect: true }],
    }

    const result = validateQuestion(invalidQuestion)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('texto de la pregunta'))).toBe(true)
  })

  test('debería fallar con texto muy corto', () => {
    const invalidQuestion = {
      text: 'Corto',
      type: 'multiple_choice',
      options: [{ text: 'Opción A', isCorrect: true }],
    }

    const result = validateQuestion(invalidQuestion)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos 10 caracteres'))).toBe(true)
  })

  test('debería fallar con tipo inválido', () => {
    const invalidQuestion = {
      text: 'Esta es una pregunta de prueba con suficientes caracteres',
      type: 'invalid_type',
      options: [{ text: 'Opción A', isCorrect: true }],
    }

    const result = validateQuestion(invalidQuestion)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('tipo de pregunta debe ser'))).toBe(true)
  })
})

describe('validateOptions', () => {
  test('debería validar opciones válidas de opción múltiple', () => {
    const validOptions = [
      { text: 'Opción A', isCorrect: true },
      { text: 'Opción B', isCorrect: false },
      { text: 'Opción C', isCorrect: false },
    ]

    const result = validateOptions(validOptions, 'multiple_choice')
    expect(result).toHaveLength(0)
  })

  test('debería fallar con opciones duplicadas', () => {
    const invalidOptions = [
      { text: 'Opción A', isCorrect: true },
      { text: 'Opción A', isCorrect: false },
    ]

    const result = validateOptions(invalidOptions, 'multiple_choice')
    expect(result.some(error => error.includes('mismo texto'))).toBe(true)
  })

  test('debería fallar sin opciones correctas', () => {
    const invalidOptions = [
      { text: 'Opción A', isCorrect: false },
      { text: 'Opción B', isCorrect: false },
    ]

    const result = validateOptions(invalidOptions, 'multiple_choice')
    expect(result.some(error => error.includes('al menos una opción correcta'))).toBe(true)
  })

  test('debería fallar con true_false con más de una opción correcta', () => {
    const invalidOptions = [
      { text: 'Verdadero', isCorrect: true },
      { text: 'Falso', isCorrect: true },
    ]

    const result = validateOptions(invalidOptions, 'true_false')
    expect(result.some(error => error.includes('exactamente una opción correcta'))).toBe(true)
  })
})

describe('validateQuestionUpdate', () => {
  test('debería validar actualización válida', () => {
    const updateData = {
      text: 'Texto actualizado con suficientes caracteres',
    }

    const result = validateQuestionUpdate(updateData)
    expect(result.isValid).toBe(true)
  })

  test('debería fallar con datos vacíos', () => {
    const result = validateQuestionUpdate({})
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos un campo'))).toBe(true)
  })
})

describe('validateQuestionId', () => {
  test('debería validar ID válido', () => {
    const result = validateQuestionId(1)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería fallar con ID inválido', () => {
    const result = validateQuestionId(-1)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('número entero positivo'))).toBe(true)
  })

  test('debería fallar con ID nulo', () => {
    const result = validateQuestionId(null)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('requerido'))).toBe(true)
  })
})
