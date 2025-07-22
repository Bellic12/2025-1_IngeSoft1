import path from 'path'
import { app } from 'electron'

/**
 * Get the path to the Logo.png file
 * @returns {string} Path to the logo file
 */
export function getLogoPath() {
  if (app.isPackaged) {
    // En producción: usar desde resources
    return path.join(process.resourcesPath, 'Logo.png')
  } else {
    // En desarrollo: usar desde public
    return path.join(process.env.VITE_PUBLIC, 'Logo.png')
  }
}
