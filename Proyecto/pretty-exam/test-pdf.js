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
      0x25,
      0x50,
      0x44,
      0x46,
      0x2d,
      0x31,
      0x2e,
      0x34,
      0x0a, // %PDF-1.4
      0x31,
      0x20,
      0x30,
      0x20,
      0x6f,
      0x62,
      0x6a,
      0x0a, // 1 0 obj
      0x3c,
      0x3c,
      0x2f,
      0x54,
      0x79,
      0x70,
      0x65,
      0x2f, // <</Type/
      0x43,
      0x61,
      0x74,
      0x61,
      0x6c,
      0x6f,
      0x67,
      0x2f, // Catalog/
      0x50,
      0x61,
      0x67,
      0x65,
      0x73,
      0x20,
      0x32,
      0x20, // Pages 2
      0x30,
      0x20,
      0x52,
      0x3e,
      0x3e,
      0x0a, // 0 R>>
      0x65,
      0x6e,
      0x64,
      0x6f,
      0x62,
      0x6a,
      0x0a, // endobj
      0x32,
      0x20,
      0x30,
      0x20,
      0x6f,
      0x62,
      0x6a,
      0x0a, // 2 0 obj
      0x3c,
      0x3c,
      0x2f,
      0x54,
      0x79,
      0x70,
      0x65,
      0x2f, // <</Type/
      0x50,
      0x61,
      0x67,
      0x65,
      0x73,
      0x2f,
      0x43,
      0x6f, // Pages/Co
      0x75,
      0x6e,
      0x74,
      0x20,
      0x30,
      0x3e,
      0x3e,
      0x0a, // unt 0>>
      0x65,
      0x6e,
      0x64,
      0x6f,
      0x62,
      0x6a,
      0x0a, // endobj
      0x78,
      0x72,
      0x65,
      0x66,
      0x0a, // xref
      0x30,
      0x20,
      0x33,
      0x0a, // 0 3
      0x30,
      0x30,
      0x30,
      0x30,
      0x30,
      0x30,
      0x30,
      0x30, // 00000000
      0x30,
      0x30,
      0x20,
      0x36,
      0x35,
      0x35,
      0x33,
      0x35, //  00 65535
      0x20,
      0x66,
      0x20,
      0x0a, //  f
      0x74,
      0x72,
      0x61,
      0x69,
      0x6c,
      0x65,
      0x72,
      0x0a, // trailer
      0x3c,
      0x3c,
      0x2f,
      0x53,
      0x69,
      0x7a,
      0x65,
      0x20, // <</Size
      0x33,
      0x2f,
      0x52,
      0x6f,
      0x6f,
      0x74,
      0x20,
      0x31, // 3/Root 1
      0x20,
      0x30,
      0x20,
      0x52,
      0x3e,
      0x3e,
      0x0a, //  0 R>>
      0x73,
      0x74,
      0x61,
      0x72,
      0x74,
      0x78,
      0x72,
      0x65, // startxre
      0x66,
      0x0a, // f
      0x31,
      0x35,
      0x36,
      0x0a, // 156
      0x25,
      0x25,
      0x45,
      0x4f,
      0x46,
      0x0a, // %%EOF
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
