import { normalizeSearchTerm } from '../normalizeSearchTerm'

describe('normalizeSearchTerm', () => {
  test('convertir a minúsculas, caso base', () => {
    expect(normalizeSearchTerm('HOLA')).toBe('hola')
    expect(normalizeSearchTerm('HoLa')).toBe('hola')
  })

  test('remover tildes', () => {
    expect(normalizeSearchTerm('Cuál')).toBe('cual')
    expect(normalizeSearchTerm('matemáticas')).toBe('matematicas')
    expect(normalizeSearchTerm('niño')).toBe('nino')
    expect(normalizeSearchTerm('corazón')).toBe('corazon')
  })

  test('casos especiales', () => {
    expect(normalizeSearchTerm('')).toBe('')
    expect(normalizeSearchTerm('   ')).toBe('')
    expect(normalizeSearchTerm(null)).toBe('')
    expect(normalizeSearchTerm(undefined)).toBe('')
  })

  test('debería limpiar espacios', () => {
    expect(normalizeSearchTerm('  hola  ')).toBe('hola')
    expect(normalizeSearchTerm('\t\nhola\n')).toBe('hola')
  })
})
