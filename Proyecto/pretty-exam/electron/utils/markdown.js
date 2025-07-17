// Convierte **texto** a <b>texto</b>
export function boldMarkdownToHtml(text) {
  if (!text) return text
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}
