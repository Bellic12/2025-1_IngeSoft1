import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Question API
contextBridge.exposeInMainWorld('questionAPI', {
  getAll: () => ipcRenderer.invoke('questions:getAll'),
  create: data => ipcRenderer.invoke('questions:create', data),
  update: (id, data) => ipcRenderer.invoke('questions:update', id, data),
  delete: id => ipcRenderer.invoke('questions:delete', id),
})

// Option API
contextBridge.exposeInMainWorld('optionAPI', {
  getAll: () => ipcRenderer.invoke('options:getAll'),
  create: data => ipcRenderer.invoke('options:create', data),
  update: (id, data) => ipcRenderer.invoke('options:update', id, data),
  delete: id => ipcRenderer.invoke('options:delete', id),
})

// Add more APIs as needed
