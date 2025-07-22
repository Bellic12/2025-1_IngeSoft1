import { ipcMain } from 'electron'
import { getLogoPath } from '../../utils/resources.js'

// Get logo path
ipcMain.handle('resources:getLogoPath', async () => {
  try {
    return getLogoPath()
  } catch (error) {
    console.error('Error getting logo path:', error)
    throw error
  }
})
