/**
 * Validaciones para el modelo Category
 */

/**
 * Valida los datos de una categoría
 * @param {Object} categoryData - Datos de la categoría a validar
 * @param {string} categoryData.name - Nombre de la categoría
 * @returns {Object} - Resultado de la validación con isValid y errors
 */
export const validateCategory = categoryData => {
  const errors = []

  // Validar que categoryData existe
  if (!categoryData) {
    return {
      isValid: false,
      errors: ['Los datos de la categoría son requeridos'],
    }
  }

  const { name } = categoryData

  // Validar nombre de la categoría
  if (!name || typeof name !== 'string') {
    errors.push('El nombre de la categoría es requerido')
  } else {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) {
      errors.push('El nombre de la categoría no puede estar vacío')
    } else if (trimmedName.length < 2) {
      errors.push('El nombre de la categoría debe tener al menos 2 caracteres')
    } else if (trimmedName.length > 100) {
      errors.push('El nombre de la categoría no puede exceder 100 caracteres')
    }

    // Validar caracteres permitidos
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\d\-_().]+$/
    if (!nameRegex.test(trimmedName)) {
      errors.push('El nombre de la categoría contiene caracteres no permitidos')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida los datos para actualizar una categoría
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} - Resultado de la validación
 */
export const validateCategoryUpdate = updateData => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un campo para actualizar'],
    }
  }

  // Si solo se está actualizando el nombre, validar como categoría completa
  if (updateData.name) {
    return validateCategory(updateData)
  }

  return {
    isValid: false,
    errors: ['No hay campos válidos para actualizar'],
  }
}

/**
 * Valida un ID de categoría
 * @param {*} categoryId - ID a validar
 * @returns {Object} - Resultado de la validación
 */
export const validateCategoryId = categoryId => {
  const errors = []

  if (categoryId === null || categoryId === undefined) {
    errors.push('El ID de la categoría es requerido')
  } else if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
    errors.push('El ID de la categoría debe ser un número entero positivo')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida que el nombre de la categoría sea único
 * @param {string} name - Nombre a validar
 * @param {Array} existingCategories - Array de categorías existentes
 * @param {number} excludeId - ID de categoría a excluir (para actualizaciones)
 * @returns {Object} - Resultado de la validación
 */
export const validateCategoryNameUniqueness = (name, existingCategories = [], excludeId = null) => {
  const errors = []

  if (!name || typeof name !== 'string') {
    errors.push('El nombre es requerido para validar unicidad')
    return {
      isValid: false,
      errors,
    }
  }

  const trimmedName = name.trim().toLowerCase()

  // Verificar si ya existe una categoría con el mismo nombre
  const duplicateCategory = existingCategories.find(category => {
    const categoryName = category.name?.trim().toLowerCase()
    const isDifferentCategory = excludeId ? category.category_id !== excludeId : true
    return categoryName === trimmedName && isDifferentCategory
  })

  if (duplicateCategory) {
    errors.push('Ya existe una categoría con este nombre')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida datos para crear múltiples categorías
 * @param {Array} categoriesData - Array de datos de categorías
 * @returns {Object} - Resultado de la validación
 */
export const validateBulkCategories = categoriesData => {
  const errors = []

  if (!Array.isArray(categoriesData)) {
    return {
      isValid: false,
      errors: ['Los datos deben ser un array de categorías'],
    }
  }

  if (categoriesData.length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos una categoría'],
    }
  }

  if (categoriesData.length > 50) {
    return {
      isValid: false,
      errors: ['No se pueden crear más de 50 categorías a la vez'],
    }
  }

  // Validar cada categoría individualmente
  categoriesData.forEach((categoryData, index) => {
    const validation = validateCategory(categoryData)
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        errors.push(`Categoría ${index + 1}: ${error}`)
      })
    }
  })

  // Validar nombres únicos dentro del array
  const names = categoriesData.map(cat => cat.name?.trim().toLowerCase()).filter(Boolean)
  const uniqueNames = new Set(names)
  if (names.length !== uniqueNames.size) {
    errors.push('No puede haber nombres de categoría duplicados en la misma operación')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
