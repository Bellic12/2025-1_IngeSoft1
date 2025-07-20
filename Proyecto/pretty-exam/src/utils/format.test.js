import {
  formatTimeSeconds,
  formatTimeString,
  formatMinutes,
  formatDate,
} from './format.js'

describe('formatTimeSeconds', () => {
  test('debería formatear segundos a hh:mm:ss si hay horas', () => {
    expect(formatTimeSeconds(3661)).toBe('1:01:01')
    expect(formatTimeSeconds(3600)).toBe('1:00:00')
  })

  test('debería formatear segundos a mm:ss si no hay horas', () => {
    expect(formatTimeSeconds(59)).toBe('0:59')
    expect(formatTimeSeconds(125)).toBe('2:05')
  })

  test('debería formatear 0 segundos', () => {
    expect(formatTimeSeconds(0)).toBe('0:00')
  })
})

describe('formatTimeString', () => {
  test('debería devolver hora en formato HH:mm', () => {
    expect(formatTimeString('2025-07-19T15:30:00')).toMatch(/15:30/)
    expect(formatTimeString('2025-07-19T05:07:00')).toMatch(/05:07/)
  })

  test('debería devolver cadena vacía si el string es vacío', () => {
    expect(formatTimeString('')).toBe('')
  })

  test('debería devolver cadena vacía si el string es null', () => {
    expect(formatTimeString(null)).toBe('')
  })
})

describe('formatMinutes', () => {
  test('debería formatear minutos a h:mm', () => {
    expect(formatMinutes(61)).toBe('1:01')
    expect(formatMinutes(125)).toBe('2:05')
  })

  test('debería devolver "0:00" si minutos es 0', () => {
    expect(formatMinutes(0)).toBe('0:00')
  })

  test('debería devolver "N/A" si minutos es inválido', () => {
    expect(formatMinutes('abc')).toBe('N/A')
    expect(formatMinutes(undefined)).toBe('N/A')
    expect(formatMinutes(null)).toBe('N/A')
  })
})

describe('formatDate', () => {
  test('debería devolver fecha en español con formato largo', () => {
    expect(formatDate('2025-07-19')).toMatch(/sábado.*19.*julio.*2025/)
  })

  test('debería devolver "N/A" si el string es vacío', () => {
    expect(formatDate('')).toBe('N/A')
  })

  test('debería devolver "N/A" si el string es null', () => {
    expect(formatDate(null)).toBe('N/A')
  })
})