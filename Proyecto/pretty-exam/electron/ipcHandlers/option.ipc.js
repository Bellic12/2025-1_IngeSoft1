import { ipcMain } from 'electron'
import OptionController from './../controllers/option.controller'

ipcMain.handle('options:getAll', async () => {
  return await OptionController.getAll()
})

ipcMain.handle('options:create', async (_, data) => {
  return await OptionController.create(data)
})

ipcMain.handle('options:update', async (_, id, data) => {
  return await OptionController.update(id, data)
})

ipcMain.handle('options:delete', async (_, id) => {
  return await OptionController.delete(id)
})
