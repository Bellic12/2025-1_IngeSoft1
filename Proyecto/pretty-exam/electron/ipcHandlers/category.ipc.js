import { ipcMain } from 'electron'
import CategoryController from '../controllers/category.controller.js'

// Get all categories
ipcMain.handle('categories:getAll', async () => {
  return await CategoryController.getAll()
})

// Create a new category
ipcMain.handle('categories:create', async (_, data) => {
  return await CategoryController.create(data)
})

// Update an existing category
ipcMain.handle('categories:update', async (_, id, data) => {
  return await CategoryController.update(id, data)
})

// Delete a category
ipcMain.handle('categories:delete', async (_, id) => {
  return await CategoryController.delete(id)
})

// Check if category name exists
ipcMain.handle('categories:nameExists', async (_, name, excludeId = null) => {
  return await CategoryController.nameExists(name, excludeId)
})
