import { app, BrowserWindow } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
// Import ipc handlers
import './ipcHandlers/question.ipc.js'
import './ipcHandlers/option.ipc.js'
import './ipcHandlers/category.ipc.js'
import './ipcHandlers/ai.ipc.js'
import './ipcHandlers/exam.ipc.js'
import './ipcHandlers/result.ipc.js'
import './ipcHandlers/userAnswer.ipc.js'
import './ipcHandlers/resources.ipc.js'
import sequelize from './config/database.js'
import path from 'node:path'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win = null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'Logo.png'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    show: false, // Don't show until ready-to-show
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      // Disable features that cause DevTools errors
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
    titleBarStyle: 'default',
    frame: true,
    resizable: true,
    maximizable: true,
    autoHideMenuBar: false, // Keep menu bar visible
  })

  // Show window when ready to prevent visual flash and focus issues
  win.once('ready-to-show', () => {
    win.show()
    win.focus()
    
    // Only open DevTools manually when needed (F12 or Ctrl+Shift+I)
    // Avoid automatic DevTools opening to prevent Autofill errors
    // if (VITE_DEV_SERVER_URL) {
    //   setTimeout(() => {
    //     win.webContents.openDevTools({ mode: 'detach' })
    //   }, 1000)
    // }
  })

  // Handle window focus events for better user experience
  win.on('blur', () => {
    // Window lost focus - could be used for auto-save features
  })

  win.on('focus', () => {
    // Window gained focus - ensure content is properly displayed
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Suppress DevTools autofill and other development errors
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    // Filter out autofill-related console errors and other DevTools warnings
    const suppressedMessages = [
      'Autofill.enable',
      "wasn't found",
      'protocol_client.js',
      'Request Autofill.enable failed',
    ]
    
    if (suppressedMessages.some(suppressed => message.includes(suppressed))) {
      // These messages are suppressed - no action needed
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Only open DevTools when explicitly requested (F12 or Ctrl+Shift+I)
    // win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    // If window exists, focus it
    if (win && !win.isDestroyed()) {
      win.show()
      win.focus()
    }
  }
})

app.whenReady().then(async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection established.')
  } catch (err) {
    console.error('Error connecting to the database:', err)
    app.quit()
    return
  }

  createWindow()
})
