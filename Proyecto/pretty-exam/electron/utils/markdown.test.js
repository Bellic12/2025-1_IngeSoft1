import { boldMarkdownToHtml } from './markdown.js'

describe('boldMarkdownToHtml', () => {
  test('convierte **texto** a <b>texto</b>', () => {
    expect(boldMarkdownToHtml('Esto es **importante**')).toBe('Esto es <b>importante</b>')
    expect(boldMarkdownToHtml('**Hola** **Mundo**')).toBe('<b>Hola</b> <b>Mundo</b>')
  })

  test('devuelve el texto original si no hay markdown', () => {
    expect(boldMarkdownToHtml('Sin formato')).toBe('Sin formato')
  })

  test('devuelve el texto original si es vacío o null', () => {
    expect(boldMarkdownToHtml('')).toBe('')
    expect(boldMarkdownToHtml(null)).toBeNull()
    expect(boldMarkdownToHtml(undefined)).toBeUndefined()
  })

  test('convierte múltiples negritas en la misma cadena', () => {
    expect(boldMarkdownToHtml('**uno** y **dos**')).toBe('<b>uno</b> y <b>dos</b>')
  })

  test('soporta texto con saltos de línea', () => {
    expect(boldMarkdownToHtml('línea1\n**línea2**')).toBe('línea1\n<b>línea2</b>')
  })
})
