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
  getByCategory: categoryId => ipcRenderer.invoke('questions:getByCategory', categoryId),
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
  getById: id => ipcRenderer.invoke('exams:getById', id),
  create: data => ipcRenderer.invoke('exams:create', data),
  update: (id, data) => ipcRenderer.invoke('exams:update', id, data),
  delete: id => ipcRenderer.invoke('exams:delete', id),
  getQuestions: examId => ipcRenderer.invoke('exams:getQuestions', examId),
  addQuestions: (examId, questionIds) =>
    ipcRenderer.invoke('exams:addQuestions', examId, questionIds),
  removeQuestions: (examId, questionIds) =>
    ipcRenderer.invoke('exams:removeQuestions', examId, questionIds),
})

// Category API
contextBridge.exposeInMainWorld('categoryAPI', {
  getAll: () => ipcRenderer.invoke('categories:getAll'),
  create: data => ipcRenderer.invoke('categories:create', data),
  update: (id, data) => ipcRenderer.invoke('categories:update', id, data),
  delete: id => ipcRenderer.invoke('categories:delete', id),
  nameExists: (name, excludeId) => ipcRenderer.invoke('categories:nameExists', name, excludeId),
})

// Result API
contextBridge.exposeInMainWorld('resultAPI', {
  getAll: () => ipcRenderer.invoke('results:getAll'),
  getById: id => ipcRenderer.invoke('results:getById', id),
  getByExamId: examId => ipcRenderer.invoke('results:getByExamId', examId),
  create: data => ipcRenderer.invoke('results:create', data),
  delete: id => ipcRenderer.invoke('results:delete', id),
})

// UserAnswer API
contextBridge.exposeInMainWorld('userAnswerAPI', {
  getAll: () => ipcRenderer.invoke('userAnswers:getAll'),
  getById: (resultId, questionId) =>
    ipcRenderer.invoke('userAnswers:getById', resultId, questionId),
  create: data => ipcRenderer.invoke('userAnswers:create', data),
  delete: (resultId, questionId) => ipcRenderer.invoke('userAnswers:delete', resultId, questionId),
})

// AI API
contextBridge.exposeInMainWorld('aiAPI', {
  extractPdfText: buffer => ipcRenderer.invoke('ai:extractPdfText', buffer),
  generateQuestionsFromPDF: data => ipcRenderer.invoke('ai:generateQuestionsFromPDF', data),
  generateQuestions: data => ipcRenderer.invoke('ai:generateQuestions', data),
  explainQuestion: (questionId, optionSelectedId) =>
    ipcRenderer.invoke('ai:explainQuestion', questionId, optionSelectedId),
  feedbackExam: (examId, resultId) => ipcRenderer.invoke('ai:feedbackExam', examId, resultId),
})
