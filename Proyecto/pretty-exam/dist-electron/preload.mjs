"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("questionAPI", {
  getAll: () => electron.ipcRenderer.invoke("questions:getAll"),
  create: (data) => electron.ipcRenderer.invoke("questions:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("questions:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("questions:delete", id),
  search: (filters) => electron.ipcRenderer.invoke("questions:search", filters)
});
electron.contextBridge.exposeInMainWorld("optionAPI", {
  getAll: () => electron.ipcRenderer.invoke("options:getAll"),
  create: (data) => electron.ipcRenderer.invoke("options:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("options:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("options:delete", id)
});
electron.contextBridge.exposeInMainWorld("examAPI", {
  getAll: () => electron.ipcRenderer.invoke("exams:getAll"),
  create: (data) => electron.ipcRenderer.invoke("exams:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("exams:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("exams:delete", id)
});
electron.contextBridge.exposeInMainWorld("categoryAPI", {
  getAll: () => electron.ipcRenderer.invoke("categories:getAll"),
  create: (data) => electron.ipcRenderer.invoke("categories:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("categories:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("categories:delete", id),
  nameExists: (name, excludeId) => electron.ipcRenderer.invoke("categories:nameExists", name, excludeId)
});
