/**
 * Convierte texto en formato Markdown (**texto**) a HTML (<b>texto</b>)
 * @param {string} text - Texto en formato Markdown
 * @returns {string} - Texto con negritas convertido a HTML
 */
export function boldMarkdownToHtml(text) {
  if (!text) return text
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}
