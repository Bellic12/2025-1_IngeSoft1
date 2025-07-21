// Script de prueba para verificar si PDF.js funciona correctamente
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

async function testPdfJs() {
  try {
    console.log('=== INICIANDO PRUEBA DE PDF.JS ===')
    
    // Intentar cargar PDF.js usando la versión legacy MJS
    console.log('1. Intentando cargar PDF.js (legacy mjs)...')
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    console.log('✅ PDF.js cargado exitosamente')
    console.log('Versión:', pdfjsLib.version)
    
    // Verificar GlobalWorkerOptions
    console.log('2. Verificando GlobalWorkerOptions...')
    if (pdfjsLib.GlobalWorkerOptions) {
      console.log('✅ GlobalWorkerOptions disponible')
      // Usar el worker legacy si está disponible
      try {
        const workerPath = 'pdfjs-dist/legacy/build/pdf.worker.mjs'
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath
        console.log('✅ Worker configurado:', workerPath)
      } catch (workerError) {
        console.log('⚠️ No se pudo configurar worker, usando modo compatibilidad')
        pdfjsLib.GlobalWorkerOptions.workerSrc = false
      }
    } else {
      console.log('⚠️ GlobalWorkerOptions no disponible')
    }
    
    // Crear un PDF mínimo de prueba (PDF vacío básico) como Uint8Array
    console.log('3. Creando PDF de prueba...')
    const testPdfBuffer = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, // %PDF-1.4
      0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A,       // 1 0 obj
      0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F,       // <</Type/
      0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F,       // Catalog/
      0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20,       // Pages 2 
      0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A,                   // 0 R>>
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A,             // endobj
      0x32, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A,       // 2 0 obj
      0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F,       // <</Type/
      0x50, 0x61, 0x67, 0x65, 0x73, 0x2F, 0x43, 0x6F,       // Pages/Co
      0x75, 0x6E, 0x74, 0x20, 0x30, 0x3E, 0x3E, 0x0A,       // unt 0>>
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A,             // endobj
      0x78, 0x72, 0x65, 0x66, 0x0A,                         // xref
      0x30, 0x20, 0x33, 0x0A,                               // 0 3
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,       // 00000000
      0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35,       //  00 65535
      0x20, 0x66, 0x20, 0x0A,                               //  f 
      0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A,       // trailer
      0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20,       // <</Size 
      0x33, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31,       // 3/Root 1
      0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A,             //  0 R>>
      0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65,       // startxre
      0x66, 0x0A,                                           // f
      0x31, 0x35, 0x36, 0x0A,                               // 156
      0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A                    // %%EOF
    ])
    
    console.log('✅ PDF de prueba creado, tamaño:', testPdfBuffer.length, 'bytes')
    
    // Intentar procesar el PDF
    console.log('4. Intentando procesar PDF...')
    const loadingTask = pdfjsLib.getDocument({
      data: testPdfBuffer,
      verbosity: 0,
      disableFontFace: true,
      disableStream: true,
      disableRange: true,
    })
    
    console.log('5. Esperando que se cargue el documento...')
    const pdf = await loadingTask.promise
    console.log('✅ PDF cargado exitosamente, páginas:', pdf.numPages)
    
    console.log('=== PRUEBA EXITOSA ===')
    console.log('PDF.js está funcionando correctamente en este entorno')
    
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:')
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
    
    if (error.message.includes('require')) {
      console.log('💡 Sugerencia: El problema parece estar en la carga de pdfjs-dist')
      console.log('   Intenta reinstalar la dependencia: npm install pdfjs-dist')
    }
  }
}

// Ejecutar la prueba
testPdfJs()
