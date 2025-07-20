/**
 * Tests para validaciones de Category
 */

import {
  validateCategory,
  validateCategoryUpdate,
  validateCategoryId,
  validateCategoryNameUniqueness,
  validateBulkCategories,
} from './category.validation.js'

describe('validateCategory', () => {
  test('debería validar categoría válida', () => {
    const validCategory = {
      name: 'Matemáticas',
    }

    const result = validateCategory(validCategory)
    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  test('debería validar categoría con caracteres especiales', () => {
    const validCategory = {
      name: 'Ciencias Naturales - Física (Básica)',
    }

    const result = validateCategory(validCategory)
    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  test('debería fallar con datos nulos', () => {
    const result = validateCategory(null)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Los datos de la categoría son requeridos')
  })

  test('debería fallar con nombre vacío', () => {
    const invalidCategory = {
      name: '',
    }

    const result = validateCategory(invalidCategory)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('nombre de la categoría'))).toBe(true)
  })

  test('debería fallar con nombre muy corto', () => {
    const invalidCategory = {
      name: 'A',
    }

    const result = validateCategory(invalidCategory)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos 2 caracteres'))).toBe(true)
  })

  test('debería fallar con caracteres no permitidos', () => {
    const invalidCategory = {
      name: 'Categoría@#$%',
    }

    const result = validateCategory(invalidCategory)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('caracteres no permitidos'))).toBe(true)
  })
})

describe('validateCategoryUpdate', () => {
  test('debería validar actualización válida', () => {
    const updateData = {
      name: 'Categoría actualizada',
    }

    const result = validateCategoryUpdate(updateData)
    expect(result.isValid).toBe(true)
  })

  test('debería fallar con datos vacíos', () => {
    const result = validateCategoryUpdate({})
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos un campo'))).toBe(true)
  })
})

describe('validateCategoryId', () => {
  test('debería validar ID válido', () => {
    const result = validateCategoryId(1)
    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  test('debería fallar con ID inválido', () => {
    const result = validateCategoryId(-1)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('número entero positivo'))).toBe(true)
  })
})

describe('validateCategoryNameUniqueness', () => {
  test('debería validar nombre único', () => {
    const existingCategories = [
      { category_id: 1, name: 'Matemáticas' },
      { category_id: 2, name: 'Ciencias' },
    ]

    const result = validateCategoryNameUniqueness('Historia', existingCategories)
    expect(result.isValid).toBe(true)
  })

  test('debería fallar con nombre duplicado', () => {
    const existingCategories = [
      { category_id: 1, name: 'Matemáticas' },
      { category_id: 2, name: 'Ciencias' },
    ]

    const result = validateCategoryNameUniqueness('Matemáticas', existingCategories)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('Ya existe una categoría'))).toBe(true)
  })

  test('debería permitir actualizar misma categoría', () => {
    const existingCategories = [
      { category_id: 1, name: 'Matemáticas' },
      { category_id: 2, name: 'Ciencias' },
    ]

    const result = validateCategoryNameUniqueness('Matemáticas', existingCategories, 1)
    expect(result.isValid).toBe(true)
  })
})

describe('validateBulkCategories', () => {
  test('debería validar múltiples categorías válidas', () => {
    const categories = [{ name: 'Matemáticas' }, { name: 'Ciencias' }, { name: 'Historia' }]

    const result = validateBulkCategories(categories)
    expect(result.isValid).toBe(true)
  })

  test('debería fallar con datos no array', () => {
    const result = validateBulkCategories('no es un array')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('array de categorías'))).toBe(true)
  })

  test('debería fallar con array vacío', () => {
    const result = validateBulkCategories([])
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('al menos una categoría'))).toBe(true)
  })

  test('debería fallar con nombres duplicados', () => {
    const categories = [{ name: 'Matemáticas' }, { name: 'Matemáticas' }]

    const result = validateBulkCategories(categories)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('duplicados'))).toBe(true)
  })
})
