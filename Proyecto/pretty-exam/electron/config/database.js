import { Sequelize } from 'sequelize'
import path, { join } from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(__dirname, '..', '..', 'db.db'),
  logging: false,
})

export default sequelize
