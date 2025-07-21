
"use strict";const n=require("electron");n.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[r,i]=e;return n.ipcRenderer.on(r,(t,...o)=>i(t,...o))},off(...e){const[r,...i]=e;return n.ipcRenderer.off(r,...i)},send(...e){const[r,...i]=e;return n.ipcRenderer.send(r,...i)},invoke(...e){const[r,...i]=e;return n.ipcRenderer.invoke(r,...i)}});n.contextBridge.exposeInMainWorld("questionAPI",{getAll:()=>n.ipcRenderer.invoke("questions:getAll"),create:e=>n.ipcRenderer.invoke("questions:create",e),update:(e,r)=>n.ipcRenderer.invoke("questions:update",e,r),delete:e=>n.ipcRenderer.invoke("questions:delete",e),search:e=>n.ipcRenderer.invoke("questions:search",e),getByCategory:e=>n.ipcRenderer.invoke("questions:getByCategory",e)});n.contextBridge.exposeInMainWorld("optionAPI",{getAll:()=>n.ipcRenderer.invoke("options:getAll"),create:e=>n.ipcRenderer.invoke("options:create",e),update:(e,r)=>n.ipcRenderer.invoke("options:update",e,r),delete:e=>n.ipcRenderer.invoke("options:delete",e)});n.contextBridge.exposeInMainWorld("examAPI",{getAll:()=>n.ipcRenderer.invoke("exams:getAll"),getById:e=>n.ipcRenderer.invoke("exams:getById",e),create:e=>n.ipcRenderer.invoke("exams:create",e),update:(e,r)=>n.ipcRenderer.invoke("exams:update",e,r),delete:e=>n.ipcRenderer.invoke("exams:delete",e),getQuestions:e=>n.ipcRenderer.invoke("exams:getQuestions",e),addQuestions:(e,r)=>n.ipcRenderer.invoke("exams:addQuestions",e,r),removeQuestions:(e,r)=>n.ipcRenderer.invoke("exams:removeQuestions",e,r)});n.contextBridge.exposeInMainWorld("categoryAPI",{getAll:()=>n.ipcRenderer.invoke("categories:getAll"),create:e=>n.ipcRenderer.invoke("categories:create",e),update:(e,r)=>n.ipcRenderer.invoke("categories:update",e,r),delete:e=>n.ipcRenderer.invoke("categories:delete",e),nameExists:(e,r)=>n.ipcRenderer.invoke("categories:nameExists",e,r)});n.contextBridge.exposeInMainWorld("aiAPI",{explainQuestion:(e,r)=>n.ipcRenderer.invoke("ai:explainQuestion",e,r),feedbackExam:(e,r)=>n.ipcRenderer.invoke("ai:feedbackExam",e,r)});n.contextBridge.exposeInMainWorld("resultAPI",{getAll:()=>n.ipcRenderer.invoke("results:getAll"),getById:e=>n.ipcRenderer.invoke("results:getById",e),getByExamId:e=>n.ipcRenderer.invoke("results:getByExamId",e),create:e=>n.ipcRenderer.invoke("results:create",e),delete:e=>n.ipcRenderer.invoke("results:delete",e)});n.contextBridge.exposeInMainWorld("userAnswerAPI",{getAll:()=>n.ipcRenderer.invoke("userAnswers:getAll"),getById:(e,r)=>n.ipcRenderer.invoke("userAnswers:getById",e,r),create:e=>n.ipcRenderer.invoke("userAnswers:create",e),delete:(e,r)=>n.ipcRenderer.invoke("userAnswers:delete",e,r)});
=======
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
  search: (filters) => electron.ipcRenderer.invoke("questions:search", filters),
  getByCategory: (categoryId) => electron.ipcRenderer.invoke("questions:getByCategory", categoryId)
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
electron.contextBridge.exposeInMainWorld("aiAPI", {
  extractPdfText: (buffer) => electron.ipcRenderer.invoke("ai:extractPdfText", buffer),
  generateQuestionsFromPDF: (data) => electron.ipcRenderer.invoke("ai:generateQuestionsFromPDF", data),
  generateQuestions: (data) => electron.ipcRenderer.invoke("ai:generateQuestions", data),
  explainQuestion: (questionId, optionSelectedId) => electron.ipcRenderer.invoke("ai:explainQuestion", questionId, optionSelectedId),
  feedbackExam: (examId, resultId) => electron.ipcRenderer.invoke("ai:feedbackExam", examId, resultId)
});
