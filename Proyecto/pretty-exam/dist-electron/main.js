import { app as _, ipcMain as r, BrowserWindow as P } from "electron";
import { fileURLToPath as b } from "node:url";
import { Sequelize as L, DataTypes as s, Op as C } from "sequelize";
import G, { join as I } from "path";
import R from "fs";
import g from "node:path";
const v = G.dirname(b(import.meta.url));
function K() {
  let t;
  if (_.isPackaged) {
    const e = _.getPath("userData");
    t = I(e, "pretty_exam.db");
    const a = I(process.resourcesPath, "pretty_exam.db");
    !R.existsSync(t) && R.existsSync(a) && R.copyFileSync(a, t);
  } else
    t = I(v, "..", "..", "pretty_exam.db");
  return t;
}
const n = new L({
  dialect: "sqlite",
  storage: K(),
  logging: !1
}), u = n.define(
  "Category",
  {
    category_id: { type: s.INTEGER, primaryKey: !0, autoIncrement: !0 },
    name: { type: s.STRING, allowNull: !1 },
    created_at: {
      type: s.DATE,
      defaultValue: s.NOW,
      allowNull: !1
    }
  },
  {
    tableName: "Category",
    timestamps: !1
  }
);
u.associate = () => {
  u.hasMany(i, {
    foreignKey: "category_id",
    as: "questions"
  });
};
const c = n.define(
  "Option",
  {
    option_id: { type: s.INTEGER, primaryKey: !0, autoIncrement: !0 },
    text: { type: s.TEXT, allowNull: !1 },
    is_correct: { type: s.BOOLEAN, defaultValue: !1 },
    question_id: { type: s.INTEGER, allowNull: !1 }
    /** created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },**/
  },
  {
    tableName: "Option",
    timestamps: !1
  }
);
c.associate = () => {
  c.belongsTo(i, {
    foreignKey: "question_id",
    as: "question"
  });
};
const d = n.define(
  "Exam",
  {
    exam_id: { type: s.INTEGER, primaryKey: !0, autoIncrement: !0 },
    name: { type: s.TEXT, allowNull: !1 },
    description: { type: s.TEXT, allowNull: !0 },
    duration_minutes: { type: s.INTEGER, allowNull: !0, validate: { isInt: !0 } },
    created_at: { type: s.DATE, defaultValue: s.NOW, allowNull: !1 },
    updated_at: { type: s.DATE, defaultValue: s.NOW, allowNull: !1 }
  },
  {
    tableName: "Exam",
    timestamps: !1
  }
);
d.associate = () => {
  d.belongsToMany(i, {
    through: "ExamQuestion",
    foreignKey: "exam_id",
    otherKey: "question_id",
    timestamps: !1,
    as: "questions",
    onDelete: "CASCADE"
  });
};
const i = n.define(
  "Question",
  {
    question_id: { type: s.INTEGER, primaryKey: !0, autoIncrement: !0 },
    text: { type: s.TEXT, allowNull: !1 },
    type: { type: s.STRING, allowNull: !1 },
    category_id: s.INTEGER,
    source: { type: s.STRING, defaultValue: "manual", allowNull: !0 },
    created_at: { type: s.DATE, defaultValue: s.NOW, allowNull: !1 },
    updated_at: { type: s.DATE, defaultValue: s.NOW, allowNull: !1 }
  },
  {
    tableName: "Question",
    timestamps: !1
  }
);
i.associate = () => {
  i.hasMany(c, {
    foreignKey: "question_id",
    onDelete: "CASCADE",
    as: "options"
  }), i.belongsTo(u, {
    foreignKey: "category_id",
    as: "category"
  }), i.belongsToMany(d, {
    through: "ExamQuestion",
    foreignKey: "question_id",
    otherKey: "exam_id",
    timestamps: !1,
    as: "exams",
    onDelete: "CASCADE"
  });
};
const y = n.define(
  "UserAnswer",
  {
    result_id: { type: s.INTEGER, primaryKey: !0, allowNull: !1 },
    question_id: { type: s.INTEGER, primaryKey: !0, allowNull: !1 },
    option_id: { type: s.INTEGER, allowNull: !1 },
    is_correct: { type: s.BOOLEAN, allowNull: !1 }
  },
  {
    tableName: "UserAnswer",
    timestamps: !1
  }
);
y.associate = () => {
  y.belongsTo(m, { foreignKey: "result_id", as: "result", onDelete: "CASCADE" }), y.belongsTo(i, { foreignKey: "question_id", as: "question", onDelete: "CASCADE" }), y.belongsTo(c, { foreignKey: "option_id", as: "option", onDelete: "CASCADE" });
};
const m = n.define(
  "Result",
  {
    result_id: { type: s.INTEGER, primaryKey: !0, autoIncrement: !0 },
    exam_id: { type: s.INTEGER, allowNull: !1 },
    score: { type: s.INTEGER, allowNull: !1, validate: { min: 0, max: 100 } },
    correct_answers: { type: s.INTEGER, allowNull: !1 },
    incorrect_answers: { type: s.INTEGER, allowNull: !1 },
    time_used: { type: s.INTEGER, allowNull: !1 },
    taken_at: { type: s.DATE, defaultValue: s.NOW, allowNull: !1 }
  },
  {
    tableName: "Result",
    timestamps: !1
  }
);
m.associate = () => {
  m.belongsTo(d, {
    foreignKey: "exam_id",
    as: "exam",
    onDelete: "CASCADE"
  }), m.hasMany(y, {
    foreignKey: "result_id",
    as: "userAnswers",
    onDelete: "CASCADE"
  });
};
i.associate && i.associate();
c.associate && c.associate();
u.associate && u.associate();
d.associate && d.associate();
m.associate && m.associate();
y.associate && y.associate();
const f = {
  getAll: async () => (await i.findAll({
    include: [
      { model: c, as: "options" },
      { model: u, as: "category" }
    ]
  })).map((e) => e.get({ plain: !0 })),
  getById: async (t) => {
    const e = await i.findOne({
      where: { question_id: t },
      include: [
        { model: c, as: "options" },
        { model: u, as: "category" }
      ]
    });
    if (!e)
      throw new Error(`Question with ID ${t} not found`);
    return e.get({ plain: !0 });
  },
  create: async (t) => {
    const e = await n.transaction();
    try {
      const a = await i.create(
        {
          text: t.text,
          type: t.type,
          category_id: t.category_id
        },
        { transaction: e }
      );
      for (const l of t.options)
        await c.create(
          {
            text: l.text,
            is_correct: l.is_correct,
            question_id: a.question_id
          },
          { transaction: e }
        );
      return await e.commit(), a;
    } catch (a) {
      throw await e.rollback(), a;
    }
  },
  update: async (t, e) => {
    var l;
    const a = await n.transaction();
    try {
      if (e.category_id && !await u.findByPk(e.category_id, { transaction: a }))
        throw await a.rollback(), console.error(`Category with ID ${e.category_id} does not exist`), new Error("CATEGORY_NOT_FOUND");
      if (!await i.findByPk(t, { transaction: a }))
        throw await a.rollback(), console.error(`Question with ID ${t} does not exist`), new Error("QUESTION_NOT_FOUND");
      await n.query("PRAGMA foreign_keys = OFF", {
        transaction: a,
        type: n.QueryTypes.RAW
      });
      const N = await n.query(
        "SELECT option_id FROM `Option` WHERE `question_id` = ?",
        {
          replacements: [t],
          transaction: a,
          type: n.QueryTypes.SELECT
        }
      );
      if (N.length > 0) {
        const w = N.map((h) => h.option_id);
        await n.query(
          `DELETE FROM \`UserAnswer\` WHERE \`option_id\` IN (${w.map(() => "?").join(",")})`,
          {
            replacements: w,
            transaction: a,
            type: n.QueryTypes.DELETE
          }
        );
      }
      if (await n.query("DELETE FROM `Option` WHERE `question_id` = ?", {
        replacements: [t],
        transaction: a,
        type: n.QueryTypes.DELETE
      }), await i.update(
        {
          text: e.text,
          type: e.type,
          category_id: e.category_id
        },
        { where: { question_id: t }, transaction: a }
      ), e.options && e.options.length > 0)
        for (const w of e.options)
          await c.create(
            {
              text: w.text,
              is_correct: w.is_correct,
              question_id: t
            },
            { transaction: a }
          );
      return await n.query("PRAGMA foreign_keys = ON", {
        transaction: a,
        type: n.QueryTypes.RAW
      }), await a.commit(), !0;
    } catch (o) {
      throw await a.rollback(), console.error("Error updating question:", o), o.name === "SequelizeForeignKeyConstraintError" && console.error("Foreign key constraint error details:", {
        sql: o.sql,
        original: (l = o.original) == null ? void 0 : l.message,
        table: o.table,
        fields: o.fields
      }), o.message === "CATEGORY_NOT_FOUND" ? new Error("CATEGORY_NOT_FOUND") : o.message === "QUESTION_NOT_FOUND" ? new Error("QUESTION_NOT_FOUND") : new Error("UPDATE_FAILED");
    }
  },
  delete: async (t) => await i.destroy({ where: { question_id: t } }),
  search: async (t = {}) => {
    const { searchTerm: e, categoryIds: a } = t, l = (o) => !o || typeof o != "string" ? "" : o.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    try {
      let o = {};
      if (a && a.length > 0 && (o.category_id = {
        [C.in]: a
      }), e && e.trim()) {
        const w = l(e), h = [];
        h.push({
          text: n.where(
            n.fn(
              "LOWER",
              n.fn(
                "REPLACE",
                n.fn(
                  "REPLACE",
                  n.fn(
                    "REPLACE",
                    n.fn(
                      "REPLACE",
                      n.fn("REPLACE", n.col("Question.text"), "á", "a"),
                      "é",
                      "e"
                    ),
                    "í",
                    "i"
                  ),
                  "ó",
                  "o"
                ),
                "ú",
                "u"
              )
            ),
            "LIKE",
            `%${w}%`
          )
        }), (!a || a.length === 0) && h.push(
          n.where(
            n.fn(
              "LOWER",
              n.fn(
                "REPLACE",
                n.fn(
                  "REPLACE",
                  n.fn(
                    "REPLACE",
                    n.fn(
                      "REPLACE",
                      n.fn("REPLACE", n.col("category.name"), "á", "a"),
                      "é",
                      "e"
                    ),
                    "í",
                    "i"
                  ),
                  "ó",
                  "o"
                ),
                "ú",
                "u"
              )
            ),
            "LIKE",
            `%${w}%`
          )
        );
        const D = { [C.or]: h };
        Object.keys(o).length > 0 ? o = {
          [C.and]: [o, D]
        } : o = D;
      }
      return (await i.findAll({
        where: o,
        include: [
          { model: c, as: "options" },
          { model: u, as: "category" }
        ],
        order: [["question_id", "DESC"]]
      })).map((w) => w.get({ plain: !0 }));
    } catch (o) {
      return console.error("Error in question search:", o), [];
    }
  },
  getByCategory: async (t) => (await i.findAll({
    where: { category_id: t },
    include: [
      { model: c, as: "options" },
      { model: u, as: "category" }
    ],
    order: [["question_id", "DESC"]]
  })).map((a) => a.get({ plain: !0 }))
};
r.handle("questions:getAll", async () => await f.getAll());
r.handle("questions:create", async (t, e) => await f.create(e));
r.handle("questions:update", async (t, e, a) => await f.update(e, a));
r.handle("questions:delete", async (t, e) => await f.delete(e));
r.handle("questions:search", async (t, e) => await f.search(e));
r.handle("questions:getByCategory", async (t, e) => await f.getByCategory(e));
const T = {
  getAll: async () => await c.findAll(),
  getById: async (t) => await c.findOne({ where: { option_id: t } }),
  create: async (t) => await c.create(t),
  update: async (t, e) => await c.update(e, { where: { option_id: t } }),
  delete: async (t) => await c.destroy({ where: { option_id: t } })
};
r.handle("options:getAll", async () => await T.getAll());
r.handle("options:create", async (t, e) => await T.create(e));
r.handle("options:update", async (t, e, a) => await T.update(e, a));
r.handle("options:delete", async (t, e) => await T.delete(e));
const A = {
  // Get all categories
  getAll: async () => (await u.findAll({
    order: [["name", "ASC"]]
  })).map((e) => e.get({ plain: !0 })),
  // Create a new category
  create: async (t) => {
    try {
      return (await u.create({
        name: t.name
      })).get({ plain: !0 });
    } catch (e) {
      throw e.name === "SequelizeUniqueConstraintError" ? new Error("Category name already exists") : e;
    }
  },
  // Update an existing category
  update: async (t, e) => {
    try {
      const [a] = await u.update(
        { name: e.name },
        { where: { category_id: t } }
      );
      if (a === 0)
        throw new Error("Category not found");
      return (await u.findByPk(t)).get({ plain: !0 });
    } catch (a) {
      throw a.name === "SequelizeUniqueConstraintError" ? new Error("Category name already exists") : a;
    }
  },
  // Delete a category
  delete: async (t) => {
    if (await u.destroy({
      where: { category_id: t }
    }) === 0)
      throw new Error("Category not found");
    return !0;
  },
  // Check if category name exists
  nameExists: async (t, e = null) => {
    const a = { name: t };
    return e && (a.category_id = { [u.sequelize.Op.ne]: e }), !!await u.findOne({ where: a });
  }
};
r.handle("categories:getAll", async () => await A.getAll());
r.handle("categories:create", async (t, e) => await A.create(e));
r.handle("categories:update", async (t, e, a) => await A.update(e, a));
r.handle("categories:delete", async (t, e) => await A.delete(e));
r.handle("categories:nameExists", async (t, e, a = null) => await A.nameExists(e, a));
const E = {
  // Get all exams with associated questions
  getAll: async () => (await d.findAll({
    include: [{ model: i, as: "questions" }]
  })).map((e) => e.get({ plain: !0 })),
  // Get an exam by ID with associated questions and their options
  getById: async (t) => {
    const e = await d.findByPk(t, {
      include: [
        {
          model: i,
          as: "questions",
          include: [{ model: c, as: "options" }]
        }
      ]
    });
    return e ? e.get({ plain: !0 }) : null;
  },
  // Create a new exam with associated questions
  create: async (t) => {
    const e = await n.transaction();
    try {
      const a = await d.create(
        {
          name: t.name,
          description: t.description,
          duration_minutes: t.duration_minutes
        },
        { transaction: e }
      );
      return t.question_ids && t.question_ids.length > 0 && await a.setQuestions(t.question_ids, { transaction: e }), await e.commit(), a;
    } catch (a) {
      throw await e.rollback(), a;
    }
  },
  // Update an existing exam and its associated questions
  update: async (t, e) => {
    const a = await n.transaction();
    try {
      return await d.update(
        {
          name: e.name,
          description: e.description,
          duration_minutes: e.duration_minutes
        },
        { where: { exam_id: t }, transaction: a }
      ), e.question_ids && e.question_ids.length > 0 && await (await d.findByPk(t, { transaction: a })).setQuestions(e.question_ids, { transaction: a }), await a.commit(), { message: "Exam updated successfully" };
    } catch (l) {
      throw await a.rollback(), l;
    }
  },
  // Delete an exam by ID
  delete: async (t) => {
    const e = await n.transaction();
    try {
      const a = await d.destroy({
        where: { exam_id: t },
        transaction: e
      });
      return await e.commit(), a > 0 ? { message: "Exam deleted successfully" } : null;
    } catch (a) {
      throw await e.rollback(), a;
    }
  },
  // Get questions associated with an exam
  getQuestions: async (t) => {
    const e = await d.findByPk(t, {
      include: [
        {
          model: i,
          as: "questions",
          include: [
            { model: u, as: "category" },
            { model: c, as: "options" }
          ]
        }
      ]
    });
    return e ? e.questions.map((a) => a.get({ plain: !0 })) : [];
  },
  // Add questions to an exam
  addQuestions: async (t, e) => {
    const a = await n.transaction();
    try {
      const l = await d.findByPk(t, { transaction: a });
      if (!l) throw new Error("Exam not found");
      const o = await i.findAll({
        where: { question_id: e },
        transaction: a
      });
      return await l.addQuestions(o, { transaction: a }), await a.commit(), { message: "Questions added successfully" };
    } catch (l) {
      throw await a.rollback(), l;
    }
  },
  // Remove questions from an exam
  removeQuestions: async (t, e) => {
    const a = await n.transaction();
    try {
      const l = await d.findByPk(t, { transaction: a });
      if (!l) throw new Error("Exam not found");
      const o = await i.findAll({
        where: { question_id: e },
        transaction: a
      });
      return await l.removeQuestions(o, { transaction: a }), await a.commit(), { message: "Questions removed successfully" };
    } catch (l) {
      throw await a.rollback(), l;
    }
  }
}, x = {
  getAll: async () => (await m.findAll({
    include: [
      { model: d, as: "exam" },
      { model: y, as: "userAnswers", include: [{ model: c, as: "option" }] }
    ]
  })).map((e) => e.get({ plain: !0 })),
  getByExamId: async (t) => (await m.findAll({
    where: { exam_id: t },
    order: [["taken_at", "DESC"]]
  })).map((a) => a.get({ plain: !0 })),
  getById: async (t) => {
    const e = await m.findByPk(t, {
      include: [
        { model: d, as: "exam" },
        { model: y, as: "userAnswers", include: [{ model: c, as: "option" }] }
      ]
    });
    return e ? e.get({ plain: !0 }) : null;
  },
  create: async (t) => (await m.create({
    exam_id: t.exam_id,
    score: t.score,
    correct_answers: t.correct_answers,
    incorrect_answers: t.incorrect_answers,
    time_used: t.time_used,
    taken_at: /* @__PURE__ */ new Date()
  })).get({ plain: !0 }),
  delete: async (t) => await m.destroy({ where: { result_id: t } })
};
console.log("Gemini API key is not set.");
const Q = {
  explainQuestion: async (t, e) => {
    throw new Error("Gemini API key is not set.");
  },
  // Método para retroalimentación del examen
  feedbackExam: async (t, e) => {
    throw new Error("Gemini API key is not set.");
  }
};
r.handle("ai:explainQuestion", async (t, e, a) => await Q.explainQuestion(e, a));
r.handle("ai:feedbackExam", async (t, e, a) => await Q.feedbackExam(e, a));
r.handle("exams:getAll", async () => await E.getAll());
r.handle("exams:getById", async (t, e) => await E.getById(e));
r.handle("exams:create", async (t, e) => await E.create(e));
r.handle("exams:update", async (t, e, a) => await E.update(e, a));
r.handle("exams:delete", async (t, e) => await E.delete(e));
r.handle("exams:getQuestions", async (t, e) => await E.getQuestions(e));
r.handle("exams:addQuestions", async (t, e, a) => await E.addQuestions(e, a));
r.handle("exams:removeQuestions", async (t, e, a) => await E.removeQuestions(e, a));
r.handle("results:getAll", async () => await x.getAll());
r.handle("results:getById", async (t, e) => await x.getById(e));
r.handle("results:create", async (t, e) => await x.create(e));
r.handle("results:delete", async (t, e) => await x.delete(e));
r.handle("results:getByExamId", async (t, e) => await x.getByExamId(e));
const q = {
  getAll: async () => await y.findAll({ include: ["result", "question", "option"] }),
  getById: async (t, e) => await y.findOne({
    where: { result_id: t, question_id: e },
    include: ["result", "question", "option"]
  }),
  create: async (t) => {
    const e = await c.findByPk(t.optionId);
    if (!e) throw new Error("Option not found");
    const a = !!e.is_correct;
    return await y.create({
      result_id: t.resultId,
      question_id: t.questionId,
      option_id: t.optionId,
      is_correct: a
    });
  },
  delete: async (t, e) => await y.destroy({ where: { result_id: t, question_id: e } })
};
r.handle("userAnswers:getAll", async () => await q.getAll());
r.handle("userAnswers:getById", async (t, e, a) => await q.getById(e, a));
r.handle("userAnswers:create", async (t, e) => await q.create(e));
r.handle("userAnswers:delete", async (t, e, a) => await q.delete(e, a));
const S = g.dirname(b(import.meta.url));
process.env.APP_ROOT = g.join(S, "..");
const O = process.env.VITE_DEV_SERVER_URL, z = g.join(process.env.APP_ROOT, "dist-electron"), k = g.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = O ? g.join(process.env.APP_ROOT, "public") : k;
let p = null;
function B() {
  p = new P({
    icon: g.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: g.join(S, "preload.mjs")
    }
  }), p.webContents.on("did-finish-load", () => {
    p == null || p.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), O ? p.loadURL(O) : p.loadFile(g.join(k, "index.html"));
}
_.on("window-all-closed", () => {
  process.platform !== "darwin" && (_.quit(), p = null);
});
_.on("activate", () => {
  P.getAllWindows().length === 0 && B();
});
_.whenReady().then(async () => {
  try {
    await n.authenticate(), console.log("Database connection established.");
  } catch (t) {
    console.error("Error connecting to the database:", t), _.quit();
    return;
  }
  B();
});
export {
  z as MAIN_DIST,
  k as RENDERER_DIST,
  O as VITE_DEV_SERVER_URL
};
