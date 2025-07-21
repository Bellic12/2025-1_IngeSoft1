// Función para cargar PDF.js legacy en Electron
async function loadPdfJs() {
  try {
    console.log('pdfUtils: Cargando PDF.js (legacy mjs)...')
    
    // Usar la versión legacy MJS para Node.js/Electron
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    console.log('pdfUtils: PDF.js legacy mjs cargado exitosamente')
    
    // Configurar el worker si está disponible
    if (pdfjsLib.GlobalWorkerOptions) {
      try {
        const workerPath = 'pdfjs-dist/legacy/build/pdf.worker.mjs'
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath
        console.log('pdfUtils: Worker configurado:', workerPath)
      } catch (workerError) {
        console.log('pdfUtils: No se pudo configurar worker, usando modo compatibilidad')
        pdfjsLib.GlobalWorkerOptions.workerSrc = false
      }
    }
    
    console.log('pdfUtils: PDF.js configurado exitosamente')
    return pdfjsLib
  } catch (error) {
    console.error('pdfUtils: Error crítico al cargar PDF.js:', error)
    throw new Error(`Could not load PDF.js library: ${error.message}`)
  }
}

export async function readPdfText(pdfBuffer) {
  try {
    console.log('pdfUtils: Iniciando lectura de PDF, buffer size:', pdfBuffer.byteLength)
    
    // Cargar PDF.js dinámicamente
    const pdfjsLib = await loadPdfJs()
    console.log('pdfUtils: PDF.js cargado correctamente')
    
    // Convertir Buffer a Uint8Array si es necesario
    const pdfData = pdfBuffer instanceof Uint8Array 
      ? pdfBuffer 
      : new Uint8Array(pdfBuffer)
    
    console.log('pdfUtils: Creando loading task...')
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      verbosity: 0,
      disableFontFace: true,
      disableStream: true,
      disableRange: true,
    })
    
    console.log('pdfUtils: Esperando promesa de PDF...')
    const pdf = await loadingTask.promise
    console.log('pdfUtils: PDF cargado exitosamente, páginas:', pdf.numPages)
    
    let fullText = ''
    let processedPages = 0
    
    // Extraer texto de cada página de forma más robusta
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`pdfUtils: Procesando página ${pageNum}/${pdf.numPages}`)
        
        const page = await pdf.getPage(pageNum)
        console.log(`pdfUtils: Página ${pageNum} obtenida, extrayendo texto...`)
        
        const textContent = await page.getTextContent()
        
        console.log(
          `pdfUtils: Texto de página ${pageNum} extraído, items:`,
          textContent.items.length
        )
        
        // Concatenar todo el texto de la página de forma segura
        const pageText = textContent.items
          .map(item => (item && item.str ? item.str : ''))
          .filter(str => str.trim().length > 0)
          .join(' ')
        
        if (pageText.trim().length > 0) {
          fullText += pageText + '\n\n'
          processedPages++
        }
        
        console.log(`pdfUtils: Página ${pageNum} procesada, caracteres: ${pageText.length}`)
      } catch (pageError) {
        console.error(`pdfUtils: Error procesando página ${pageNum}:`, pageError.message)
        // Continuar con las siguientes páginas en lugar de fallar
      }
    }
    
    const result = {
      text: fullText.trim(),
      pages: pdf.numPages,
    }
    
    console.log('pdfUtils: Extracción completada')
    console.log('pdfUtils: Páginas procesadas exitosamente:', processedPages, 'de', pdf.numPages)
    console.log('pdfUtils: Total caracteres:', result.text.length)
    
    if (result.text.length === 0) {
      throw new Error(
        'No se pudo extraer texto del PDF. El archivo puede contener solo imágenes o estar protegido.'
      )
    }
    
    if (processedPages === 0) {
      throw new Error('No se pudo procesar ninguna página del PDF.')
    }
    
    return result
  } catch (error) {
    console.error('pdfUtils: Error crítico extracting text from PDF:', error)
    console.error('pdfUtils: Stack trace:', error.stack)
    
    // Proporcionar errores más específicos
    let errorMessage = error.message
    if (error.message.includes('Could not load PDF.js')) {
      errorMessage = 'No se pudo cargar la librería PDF.js. Verifica la instalación.'
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'El archivo PDF está corrupto o no es válido.'
    } else if (error.message.includes('Timeout')) {
      errorMessage = 'El PDF es demasiado complejo o grande para procesar.'
    }
    
    throw new Error(errorMessage)
  }
}
