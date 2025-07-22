/**
 * Tests para validaciones de Exam
 */

import {
  validateExam,
  validateExamUpdate,
  validateExamId,
  validateExamWithQuestions,
} from '../exam.validation.js'

describe('validateExam', () => {
  test('debería validar examen válido completo', () => {
    const validExam = {
      name: 'Examen de Matemáticas',
      description: 'Examen de álgebra básica',
      duration_minutes: 60,
    }

    const result = validateExam(validExam)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería validar examen válido mínimo', () => {
    const validExam = {
      name: 'Test',
      description: null,
      duration_minutes: null,
    }

    const result = validateExam(validExam)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería fallar con datos nulos', () => {
    const result = validateExam(null)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Los datos del examen son requeridos')
  })

  test('debería fallar con nombre vacío', () => {
    const invalidExam = {
      name: '',
      description: 'Descripción válida',
      duration_minutes: 60,
    }

    const result = validateExam(invalidExam)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('nombre del examen'))).toBe(true)
  })

  test('debería fallar con nombre muy corto', () => {
    const invalidExam = {
      name: 'Ab',
      description: 'Descripción válida',
      duration_minutes: 60,
    }

    const result = validateExam(invalidExam)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos 3 caracteres'))).toBe(true)
  })

  test('debería fallar con duración inválida', () => {
    const invalidExam = {
      name: 'Examen válido',
      description: 'Descripción válida',
      duration_minutes: -5,
    }

    const result = validateExam(invalidExam)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('mayor a 0 minutos'))).toBe(true)
  })

  test('debería fallar con duración muy alta', () => {
    const invalidExam = {
      name: 'Examen válido',
      description: 'Descripción válida',
      duration_minutes: 2000,
    }

    const result = validateExam(invalidExam)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('1440 minutos'))).toBe(true)
  })
})

describe('validateExamUpdate', () => {
  test('debería validar actualización válida', () => {
    const updateData = {
      name: 'Nombre actualizado',
    }

    const result = validateExamUpdate(updateData)
    expect(result.isValid).toBe(true)
  })

  test('debería validar actualización solo de duración', () => {
    const updateData = {
      duration_minutes: 90,
    }

    const result = validateExamUpdate(updateData)
    expect(result.isValid).toBe(true)
  })

  test('debería fallar con datos vacíos', () => {
    const result = validateExamUpdate({})
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos un campo'))).toBe(true)
  })
})

describe('validateExamId', () => {
  test('debería validar ID válido', () => {
    const result = validateExamId(1)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería validar ID como string numérico', () => {
    const result = validateExamId('5')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería fallar con ID inválido', () => {
    const result = validateExamId(-1)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('número entero positivo'))).toBe(true)
  })

  test('debería fallar con ID nulo', () => {
    const result = validateExamId(null)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('requerido'))).toBe(true)
  })
})

describe('validateExamWithQuestions', () => {
  test('debería validar examen con preguntas válidas', () => {
    const validExam = {
      name: 'Examen con preguntas',
      description: 'Descripción',
      duration_minutes: 60,
    }
    const questionIds = [1, 2, 3]

    const result = validateExamWithQuestions(validExam, questionIds)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('debería fallar con array de preguntas vacío', () => {
    const validExam = {
      name: 'Examen válido',
      description: 'Descripción',
      duration_minutes: 60,
    }
    const questionIds = []

    const result = validateExamWithQuestions(validExam, questionIds)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos una pregunta'))).toBe(true)
  })

  test('debería fallar con IDs duplicados', () => {
    const validExam = {
      name: 'Examen válido',
      description: 'Descripción',
      duration_minutes: 60,
    }
    const questionIds = [1, 2, 2, 3]

    const result = validateExamWithQuestions(validExam, questionIds)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('duplicados'))).toBe(true)
  })
})
