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
  getById: (id) => electron.ipcRenderer.invoke("exams:getById", id),
  create: (data) => electron.ipcRenderer.invoke("exams:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("exams:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("exams:delete", id),
  getQuestions: (examId) => electron.ipcRenderer.invoke("exams:getQuestions", examId),
  addQuestions: (examId, questionIds) => electron.ipcRenderer.invoke("exams:addQuestions", examId, questionIds),
  removeQuestions: (examId, questionIds) => electron.ipcRenderer.invoke("exams:removeQuestions", examId, questionIds)
});
electron.contextBridge.exposeInMainWorld("categoryAPI", {
  getAll: () => electron.ipcRenderer.invoke("categories:getAll"),
  create: (data) => electron.ipcRenderer.invoke("categories:create", data),
  update: (id, data) => electron.ipcRenderer.invoke("categories:update", id, data),
  delete: (id) => electron.ipcRenderer.invoke("categories:delete", id),
  nameExists: (name, excludeId) => electron.ipcRenderer.invoke("categories:nameExists", name, excludeId)
});
electron.contextBridge.exposeInMainWorld("aiAPI", {
  explainQuestion: (questionId, optionSelectedId) => electron.ipcRenderer.invoke("ai:explainQuestion", questionId, optionSelectedId),
  feedbackExam: (examId, resultId) => electron.ipcRenderer.invoke("ai:feedbackExam", examId, resultId)
});
electron.contextBridge.exposeInMainWorld("resultAPI", {
  getAll: () => electron.ipcRenderer.invoke("results:getAll"),
  getById: (id) => electron.ipcRenderer.invoke("results:getById", id),
  getByExamId: (examId) => electron.ipcRenderer.invoke("results:getByExamId", examId),
  create: (data) => electron.ipcRenderer.invoke("results:create", data),
  delete: (id) => electron.ipcRenderer.invoke("results:delete", id)
});
electron.contextBridge.exposeInMainWorld("userAnswerAPI", {
  getAll: () => electron.ipcRenderer.invoke("userAnswers:getAll"),
  getById: (resultId, questionId) => electron.ipcRenderer.invoke("userAnswers:getById", resultId, questionId),
  create: (data) => electron.ipcRenderer.invoke("userAnswers:create", data),
  delete: (resultId, questionId) => electron.ipcRenderer.invoke("userAnswers:delete", resultId, questionId)
});
