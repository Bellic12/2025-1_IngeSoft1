/**
 * Validaciones para el modelo Question
 */

/**
 * Valida los datos de una pregunta
 * @param {Object} questionData - Datos de la pregunta a validar
 * @param {string} questionData.text - Texto de la pregunta
 * @param {string} questionData.type - Tipo de pregunta (multiple_choice, true_false)
 * @param {number|null} questionData.category_id - ID de la categoría (opcional)
 * @param {Array} questionData.options - Opciones de la pregunta
 * @returns {Object} - Resultado de la validación con isValid y errors
 */
export const validateQuestion = questionData => {
  const errors = []

  // Validar que questionData existe
  if (!questionData) {
    return {
      isValid: false,
      errors: ['Los datos de la pregunta son requeridos'],
    }
  }

  const { text, type, category_id: categoryId, options } = questionData

  // Validar texto de la pregunta
  if (!text || typeof text !== 'string') {
    errors.push('El texto de la pregunta es requerido')
  } else {
    const trimmedText = text.trim()
    if (trimmedText.length === 0) {
      errors.push('El texto de la pregunta no puede estar vacío')
    } else if (trimmedText.length < 10) {
      errors.push('El texto de la pregunta debe tener al menos 10 caracteres')
    } else if (trimmedText.length > 1000) {
      errors.push('El texto de la pregunta no puede exceder 1000 caracteres')
    }
  }

  // Validar tipo de pregunta
  const validTypes = ['multiple_choice', 'true_false']
  if (!type || typeof type !== 'string') {
    errors.push('El tipo de pregunta es requerido')
  } else if (!validTypes.includes(type)) {
    errors.push('El tipo de pregunta debe ser "multiple_choice" o "true_false"')
  }

  // Validar category_id (opcional)
  if (categoryId !== null && categoryId !== undefined) {
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      errors.push('El ID de categoría debe ser un número entero positivo')
    }
  }

  // Validar opciones
  if (!options || !Array.isArray(options)) {
    errors.push('Las opciones son requeridas y deben ser un array')
  } else {
    const optionErrors = validateOptions(options, type)
    errors.push(...optionErrors)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida las opciones de una pregunta
 * @param {Array} options - Array de opciones
 * @param {string} type - Tipo de pregunta
 * @returns {Array} - Array de errores
 */
export const validateOptions = (options, type) => {
  const errors = []

  if (options.length === 0) {
    errors.push('Debe haber al menos una opción')
    return errors
  }

  // Validaciones específicas por tipo
  if (type === 'multiple_choice') {
    if (options.length < 2) {
      errors.push('Las preguntas de opción múltiple deben tener al menos 2 opciones')
    } else if (options.length > 6) {
      errors.push('Las preguntas de opción múltiple no pueden tener más de 6 opciones')
    }
  } else if (type === 'true_false') {
    if (options.length !== 2) {
      errors.push('Las preguntas de verdadero/falso deben tener exactamente 2 opciones')
    }
  }

  // Validar cada opción
  options.forEach((option, index) => {
    if (!option || typeof option !== 'object') {
      errors.push(`La opción ${index + 1} debe ser un objeto válido`)
      return
    }

    const { text, isCorrect } = option

    // Validar texto de la opción
    if (!text || typeof text !== 'string') {
      errors.push(`El texto de la opción ${index + 1} es requerido`)
    } else {
      const trimmedText = text.trim()
      if (trimmedText.length === 0) {
        errors.push(`El texto de la opción ${index + 1} no puede estar vacío`)
      } else if (trimmedText.length > 500) {
        errors.push(`El texto de la opción ${index + 1} no puede exceder 500 caracteres`)
      }
    }

    // Validar isCorrect
    if (typeof isCorrect !== 'boolean') {
      errors.push(`La propiedad isCorrect de la opción ${index + 1} debe ser un booleano`)
    }
  })

  // Validar que hay al menos una opción correcta
  const correctOptions = options.filter(option => option.isCorrect === true)
  if (correctOptions.length === 0) {
    errors.push('Debe haber al menos una opción correcta')
  }

  // Para true_false, debe haber exactamente una opción correcta
  if (type === 'true_false' && correctOptions.length !== 1) {
    errors.push('Las preguntas de verdadero/falso deben tener exactamente una opción correcta')
  }

  // Validar opciones duplicadas
  const optionTexts = options.map(opt => opt.text?.trim().toLowerCase()).filter(Boolean)
  const uniqueTexts = new Set(optionTexts)
  if (optionTexts.length !== uniqueTexts.size) {
    errors.push('No puede haber opciones con el mismo texto')
  }

  return errors
}

/**
 * Valida los datos para actualizar una pregunta
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} - Resultado de la validación
 */
export const validateQuestionUpdate = updateData => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un campo para actualizar'],
    }
  }

  // Para actualización, validar solo los campos presentes
  const errors = []

  // Validar texto si está presente
  if (updateData.text !== undefined) {
    if (!updateData.text || typeof updateData.text !== 'string') {
      errors.push('El texto de la pregunta es requerido')
    } else {
      const trimmedText = updateData.text.trim()
      if (trimmedText.length === 0) {
        errors.push('El texto de la pregunta no puede estar vacío')
      } else if (trimmedText.length < 10) {
        errors.push('El texto de la pregunta debe tener al menos 10 caracteres')
      } else if (trimmedText.length > 1000) {
        errors.push('El texto de la pregunta no puede exceder 1000 caracteres')
      }
    }
  }

  // Validar tipo si está presente
  if (updateData.type !== undefined) {
    const validTypes = ['multiple_choice', 'true_false']
    if (!updateData.type || typeof updateData.type !== 'string') {
      errors.push('El tipo de pregunta es requerido')
    } else if (!validTypes.includes(updateData.type)) {
      errors.push('El tipo de pregunta debe ser "multiple_choice" o "true_false"')
    }
  }

  // Validar category_id si está presente
  if (updateData.category_id !== undefined && updateData.category_id !== null) {
    if (!Number.isInteger(updateData.category_id) || updateData.category_id <= 0) {
      errors.push('El ID de categoría debe ser un número entero positivo')
    }
  }

  // Validar opciones si están presentes
  if (updateData.options !== undefined) {
    if (!updateData.options || !Array.isArray(updateData.options)) {
      errors.push('Las opciones deben ser un array')
    } else {
      const type = updateData.type || 'multiple_choice'
      const optionErrors = validateOptions(updateData.options, type)
      errors.push(...optionErrors)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida un ID de pregunta
 * @param {*} questionId - ID a validar
 * @returns {Object} - Resultado de la validación
 */
export const validateQuestionId = questionId => {
  const errors = []

  if (questionId === null || questionId === undefined) {
    errors.push('El ID de la pregunta es requerido')
  } else if (!Number.isInteger(Number(questionId)) || Number(questionId) <= 0) {
    errors.push('El ID de la pregunta debe ser un número entero positivo')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
