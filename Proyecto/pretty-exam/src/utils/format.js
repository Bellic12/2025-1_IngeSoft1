/**
 * Formatea segundos en formato hh:mm:ss o mm:ss
 * @param {number} seconds - Cantidad de segundos a formatear
 * @returns {string} - Tiempo formateado
 */
export const formatTimeSeconds = seconds => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formatea una cadena de fecha en hora (HH:mm) en español
 * @param {string} dateStr - Cadena de fecha (ISO, etc.)
 * @returns {string} - Hora formateada o cadena vacía
 */
export const formatTimeString = dateStr => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Formatea minutos en formato h:mm
 * @param {number} minutes - Cantidad de minutos a formatear
 * @returns {string} - Minutos formateados o 'N/A' si es inválido
 */
export const formatMinutes = minutes => {
  if (minutes === 0) return '0:00'
  if (!minutes || isNaN(minutes)) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

/**
 * Formatea una cadena de fecha en formato largo en español
 * @param {string} dateStr - Cadena de fecha (YYYY-MM-DD o ISO)
 * @returns {string} - Fecha formateada o 'N/A' si es inválida
 */
export const formatDate = dateStr => {
  if (!dateStr) return 'N/A'
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(dateStr)
  let date
  if (match) {
    const [year, month, day] = dateStr.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(dateStr)
  }
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}
