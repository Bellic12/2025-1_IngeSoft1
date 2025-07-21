import * as pdfjsLib from 'pdfjs-dist'

// Deshabilitar worker (se procesa en el hilo principal)
pdfjsLib.GlobalWorkerOptions.workerSrc = false

export const extractText = async file => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text
}
