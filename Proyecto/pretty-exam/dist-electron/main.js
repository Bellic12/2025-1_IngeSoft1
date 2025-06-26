import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { Sequelize, DataTypes } from "sequelize";
import path, { join } from "path";
import path$1 from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: join(__dirname$1, "..", "..", "db.db"),
  logging: false
});
const Question = sequelize.define(
  "Question",
  {
    id_question: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    type: DataTypes.STRING,
    id_category: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    source: DataTypes.TEXT
  },
  {
    tableName: "question",
    timestamps: false
  }
);
const QuestionController = {
  getAll: async () => {
    return await Question.findAll();
  },
  create: async (data) => {
    return await Question.create(data);
  },
  update: async (id, data) => {
    return await Question.update(data, { where: { id_question: id } });
  },
  delete: async (id) => {
    return await Question.destroy({ where: { id_question: id } });
  }
};
ipcMain.handle("questions:getAll", async () => {
  return await QuestionController.getAll();
});
ipcMain.handle("questions:create", async (_, data) => {
  return await QuestionController.create(data);
});
ipcMain.handle("questions:update", async (_, id, data) => {
  return await QuestionController.update(id, data);
});
ipcMain.handle("questions:delete", async (_, id) => {
  return await QuestionController.delete(id);
});
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (err) {
    console.error("Error connecting to the database:", err);
    app.quit();
    return;
  }
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
