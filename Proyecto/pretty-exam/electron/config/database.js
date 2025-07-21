import { Sequelize } from 'sequelize'
import path, { join } from 'path'
import { fileURLToPath } from 'node:url'
import { app } from 'electron'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Function to get the database path
function getDatabasePath() {
  let dbPath

  if (app.isPackaged) {
    // En producción: usar el directorio de la aplicación
    const appDataPath = app.getPath('userData')
    dbPath = join(appDataPath, 'pretty_exam.db')

    // Copiar la DB desde resources si no existe
    const sourcePath = join(process.resourcesPath, 'pretty_exam.db')
    if (!fs.existsSync(dbPath) && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, dbPath)
    }
  } else {
    // En desarrollo: usar la ruta actual
    dbPath = join(__dirname, '..', 'pretty_exam.db')
  }

  return dbPath
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: getDatabasePath(),
  logging: false,
})

export default sequelize
