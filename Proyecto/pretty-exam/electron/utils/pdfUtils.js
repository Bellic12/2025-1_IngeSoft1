import pdfParse from 'pdf-parse'

export async function readPdfText(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer)
    return data.text
  } catch (error) {
    throw new Error(`Error extracting text from PDF: ${error.message}`)
  }
}


