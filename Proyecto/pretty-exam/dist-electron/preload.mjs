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
  delete: (id) => electron.ipcRenderer.invoke("questions:delete", id)
});
electron.contextBridge.exposeInMainWorld("optionAPI", {
  getAll: () => electron.ipcRenderer.invoke("options:getAll"),
  create: (data) => electron.ipcRenderer.invoke("options:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("options:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("options:delete", id)
});
