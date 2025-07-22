import { useState, useEffect } from 'react'

export const useLogoPath = () => {
  const [logoPath, setLogoPath] = useState('/Logo.png') // Fallback para desarrollo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getLogoPath = async () => {
      // Solo intentar cargar desde Electron si estamos seguros de que está disponible
      if (window.resourcesAPI && typeof window.resourcesAPI.getLogoPath === 'function') {
        setLoading(true)
        try {
          // En Electron empaquetado
          const path = await window.resourcesAPI.getLogoPath()
          setLogoPath(`file://${path}`)
        } catch (err) {
          console.error('Error getting logo path from Electron:', err)
          setError(err)
          setLogoPath('/Logo.png') // Fallback
        } finally {
          setLoading(false)
        }
      } else {
        // En navegador web (desarrollo) - usar directamente la ruta pública
        setLogoPath('/Logo.png')
        setLoading(false)
      }
    }

    getLogoPath()
  }, [])

  return { logoPath, loading, error }
}
