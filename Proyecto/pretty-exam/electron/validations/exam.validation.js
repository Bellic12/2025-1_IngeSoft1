/**
 * Validaciones para el modelo Exam
 */

/**
 * Valida los datos de un examen
 * @param {Object} examData - Datos del examen a validar
 * @param {string} examData.name - Nombre del examen
 * @param {string} examData.description - Descripción del examen (opcional)
 * @param {number} examData.duration_minutes - Duración en minutos (opcional)
 * @returns {Object} - Resultado de la validación con isValid y errors
 */
export const validateExam = examData => {
  const errors = []

  // Validar que examData existe
  if (!examData) {
    return {
      isValid: false,
      errors: ['Los datos del examen son requeridos'],
    }
  }

  const { name, description, duration_minutes: durationMinutes } = examData

  // Validar nombre del examen
  if (!name || typeof name !== 'string') {
    errors.push('El nombre del examen es requerido')
  } else {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) {
      errors.push('El nombre del examen no puede estar vacío')
    } else if (trimmedName.length < 3) {
      errors.push('El nombre del examen debe tener al menos 3 caracteres')
    } else if (trimmedName.length > 200) {
      errors.push('El nombre del examen no puede exceder 200 caracteres')
    }
  }

  // Validar descripción (opcional)
  if (description !== null && description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('La descripción debe ser una cadena de texto')
    } else if (description.trim().length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres')
    }
  }

  // Validar duración en minutos (opcional)
  if (durationMinutes !== null && durationMinutes !== undefined) {
    const duration = Number(durationMinutes)
    if (!Number.isInteger(duration)) {
      errors.push('La duración debe ser un número entero')
    } else if (duration <= 0) {
      errors.push('La duración debe ser mayor a 0 minutos')
    } else if (duration > 1440) {
      // 24 horas máximo
      errors.push('La duración no puede exceder 1440 minutos (24 horas)')
    } else if (duration < 5) {
      errors.push('La duración debe ser de al menos 5 minutos')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida los datos para actualizar un examen
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} - Resultado de la validación
 */
export const validateExamUpdate = updateData => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un campo para actualizar'],
    }
  }

  // Crear un objeto con valores por defecto para campos no proporcionados
  const validationData = {
    name: updateData.name || 'Examen temporal', // Valor por defecto para validación
    description: updateData.description,
    duration_minutes: updateData.duration_minutes,
  }

  // Si no se proporciona nombre, solo validar los campos presentes
  if (!updateData.name) {
    const partialErrors = []

    // Validar descripción si está presente
    if (updateData.description !== undefined) {
      if (updateData.description !== null && typeof updateData.description !== 'string') {
        partialErrors.push('La descripción debe ser una cadena de texto')
      } else if (updateData.description && updateData.description.trim().length > 1000) {
        partialErrors.push('La descripción no puede exceder 1000 caracteres')
      }
    }

    // Validar duración si está presente
    if (updateData.duration_minutes !== undefined) {
      if (updateData.duration_minutes !== null) {
        const duration = Number(updateData.duration_minutes)
        if (!Number.isInteger(duration)) {
          partialErrors.push('La duración debe ser un número entero')
        } else if (duration <= 0) {
          partialErrors.push('La duración debe ser mayor a 0 minutos')
        } else if (duration > 1440) {
          partialErrors.push('La duración no puede exceder 1440 minutos (24 horas)')
        } else if (duration < 5) {
          partialErrors.push('La duración debe ser de al menos 5 minutos')
        }
      }
    }

    return {
      isValid: partialErrors.length === 0,
      errors: partialErrors,
    }
  }

  return validateExam(validationData)
}

/**
 * Valida un ID de examen
 * @param {*} examId - ID a validar
 * @returns {Object} - Resultado de la validación
 */
export const validateExamId = examId => {
  const errors = []

  if (examId === null || examId === undefined) {
    errors.push('El ID del examen es requerido')
  } else if (!Number.isInteger(Number(examId)) || Number(examId) <= 0) {
    errors.push('El ID del examen debe ser un número entero positivo')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida los datos para crear un examen con preguntas
 * @param {Object} examData - Datos del examen
 * @param {Array} questionIds - Array de IDs de preguntas a asociar
 * @returns {Object} - Resultado de la validación
 */
export const validateExamWithQuestions = (examData, questionIds) => {
  const examValidation = validateExam(examData)

  if (!examValidation.isValid) {
    return examValidation
  }

  const errors = []

  // Validar questionIds
  if (questionIds && Array.isArray(questionIds)) {
    if (questionIds.length === 0) {
      errors.push('Debe asociar al menos una pregunta al examen')
    } else {
      questionIds.forEach((id, index) => {
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
          errors.push(
            `El ID de pregunta en la posición ${index + 1} debe ser un número entero positivo`
          )
        }
      })

      // Verificar que no hay IDs duplicados
      const uniqueIds = new Set(questionIds)
      if (uniqueIds.size !== questionIds.length) {
        errors.push('No puede haber IDs de pregunta duplicados')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
