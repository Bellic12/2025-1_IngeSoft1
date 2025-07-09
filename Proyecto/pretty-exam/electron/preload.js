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
  search: filters => ipcRenderer.invoke('questions:search', filters),
})

// Option API
contextBridge.exposeInMainWorld('optionAPI', {
  getAll: () => ipcRenderer.invoke('options:getAll'),
  create: data => ipcRenderer.invoke('options:create', data),
  update: (id, data) => ipcRenderer.invoke('options:update', id, data),
  delete: id => ipcRenderer.invoke('options:delete', id),
})

// Exam API
contextBridge.exposeInMainWorld('examAPI', {
  getAll: () => ipcRenderer.invoke('exams:getAll'),
  create: data => ipcRenderer.invoke('exams:create', data),
  update: (id, data) => ipcRenderer.invoke('exams:update', id, data),
  delete: id => ipcRenderer.invoke('exams:delete', id),
})

// Category API
contextBridge.exposeInMainWorld('categoryAPI', {
  getAll: () => ipcRenderer.invoke('categories:getAll'),
  create: data => ipcRenderer.invoke('categories:create', data),
  update: (id, data) => ipcRenderer.invoke('categories:update', id, data),
  delete: id => ipcRenderer.invoke('categories:delete', id),
  nameExists: (name, excludeId) => ipcRenderer.invoke('categories:nameExists', name, excludeId),
})
