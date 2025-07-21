import { ipcMain as s, app as h, BrowserWindow as O } from "electron";
import { fileURLToPath as D } from "node:url";
import { Sequelize as B, DataTypes as r, Op as C } from "sequelize";
import L, { join as S } from "path";
import E from "node:path";
const G = L.dirname(D(import.meta.url)), n = new B({
  dialect: "sqlite",
  storage: S(G, "..", "pretty_exam.db"),
  logging: !1
}), u = n.define(
  "Category",
  {
    category_id: { type: r.INTEGER, primaryKey: !0, autoIncrement: !0 },
    name: { type: r.STRING, allowNull: !1 },
    created_at: {
      type: r.DATE,
      defaultValue: r.NOW,
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
    option_id: { type: r.INTEGER, primaryKey: !0, autoIncrement: !0 },
    text: { type: r.TEXT, allowNull: !1 },
    is_correct: { type: r.BOOLEAN, defaultValue: !1 },
    question_id: { type: r.INTEGER, allowNull: !1 }
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
    exam_id: { type: r.INTEGER, primaryKey: !0, autoIncrement: !0 },
    name: { type: r.TEXT, allowNull: !1 },
    description: { type: r.TEXT, allowNull: !0 },
    duration_minutes: { type: r.INTEGER, allowNull: !0, validate: { isInt: !0 } },
    created_at: { type: r.DATE, defaultValue: r.NOW, allowNull: !1 },
    updated_at: { type: r.DATE, defaultValue: r.NOW, allowNull: !1 }
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
    question_id: { type: r.INTEGER, primaryKey: !0, autoIncrement: !0 },
    text: { type: r.TEXT, allowNull: !1 },
    type: { type: r.STRING, allowNull: !1 },
    category_id: r.INTEGER,
    source: { type: r.STRING, defaultValue: "manual", allowNull: !0 },
    created_at: { type: r.DATE, defaultValue: r.NOW, allowNull: !1 },
    updated_at: { type: r.DATE, defaultValue: r.NOW, allowNull: !1 }
    question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    category_id: DataTypes.INTEGER,
    source: {
      type: DataTypes.STRING,
      defaultValue: "manual",
      allowNull: true,
      validate: {
        isIn: [["manual", "generated"]]
      }
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
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
    result_id: { type: r.INTEGER, primaryKey: !0, allowNull: !1 },
    question_id: { type: r.INTEGER, primaryKey: !0, allowNull: !1 },
    option_id: { type: r.INTEGER, allowNull: !1 },
    is_correct: { type: r.BOOLEAN, allowNull: !1 }
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
    result_id: { type: r.INTEGER, primaryKey: !0, autoIncrement: !0 },
    exam_id: { type: r.INTEGER, allowNull: !1 },
    score: { type: r.INTEGER, allowNull: !1, validate: { min: 0, max: 100 } },
    correct_answers: { type: r.INTEGER, allowNull: !1 },
    incorrect_answers: { type: r.INTEGER, allowNull: !1 },
    time_used: { type: r.INTEGER, allowNull: !1 },
    taken_at: { type: r.DATE, defaultValue: r.NOW, allowNull: !1 }
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
const _ = {
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
  getById: async (id) => {
    const question = await Question.findOne({
      where: { question_id: id },
      include: [
        { model: Option, as: "options" },
        { model: Category, as: "category" }
      ]
    });
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }
    return question.get({ plain: true });
  },
  // Create a new question with options - UPDATED
  create: async (data) => {
    const t = await sequelize.transaction();
    try {
      let category = null;
      if (data.category_id && typeof data.category_id === "number") {
        category = await Category.findByPk(data.category_id, { transaction: t });
        if (!category) {
          category = await Category.findOne({
            where: { name: "General" },
            transaction: t
          });
        }
      } else {
        const categoryName = data.category_name || "General";
        category = await Category.findOne({
          where: { name: categoryName },
          transaction: t
        });
        if (!category) {
          category = await Category.create({ name: categoryName }, { transaction: t });
        }
      }
      const questionData = {
        text: data.text,
        type: data.type,
        category_id: category.category_id,
        // Usar la categoría encontrada/creada
        source: data.source || "manual"
      };
      const question = await Question.create(questionData, { transaction: t });
      if (data.options && Array.isArray(data.options)) {
        for (const opt of data.options) {
          await Option.create(
            {
              text: opt.text,
              is_correct: opt.is_correct,
              question_id: question.question_id
            },
            { transaction: t }
          );
        }
      }
      await t.commit();
      const createdQuestion = await QuestionController.getById(question.question_id);
      return createdQuestion;
    } catch (err) {
      await t.rollback();
      console.error("QuestionController: Error creando pregunta:", err);
      throw err;
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
      const x = await n.query(
        "SELECT option_id FROM `Option` WHERE `question_id` = ?",
        {
          replacements: [t],
          transaction: a,
          type: n.QueryTypes.SELECT
        }
      );
      if (x.length > 0) {
        const w = x.map((f) => f.option_id);
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
        }
      }
      await sequelize.query("PRAGMA foreign_keys = ON", {
        transaction: t,
        type: sequelize.QueryTypes.RAW
      });
      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      console.error("Error updating question:", err);
      if (err.name === "SequelizeForeignKeyConstraintError") {
        console.error("Foreign key constraint error details:", {
          sql: err.sql,
          original: (_a = err.original) == null ? void 0 : _a.message,
          table: err.table,
          fields: err.fields
        });
      }
      if (err.message === "CATEGORY_NOT_FOUND") {
        throw new Error("CATEGORY_NOT_FOUND");
      }
      if (err.message === "QUESTION_NOT_FOUND") {
        throw new Error("QUESTION_NOT_FOUND");
      }
      throw new Error("UPDATE_FAILED");
    }
  },
  delete: async (id) => {
    return await Question.destroy({ where: { question_id: id } });
  },
  search: async (filters = {}) => {
    const { searchTerm, categoryIds } = filters;
    const normalizeSearchTerm = (text) => {
      if (!text || typeof text !== "string") {
        return "";
      }
      return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    };
    try {
      let o = {};
      if (a && a.length > 0 && (o.category_id = {
        [C.in]: a
      }), e && e.trim()) {
        const w = l(e), f = [];
        f.push({
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
        }), (!a || a.length === 0) && f.push(
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
        const R = { [C.or]: f };
        Object.keys(o).length > 0 ? o = {
          [C.and]: [o, R]
        } : o = R;
      }
      return (await i.findAll({
        where: o,
        include: [
          { model: c, as: "options" },
          { model: u, as: "category" }
        ],
        order: [["question_id", "DESC"]]
      });
      return questions.map((q) => q.get({ plain: true }));
    } catch (error) {
      console.error("Error in question search:", error);
      return [];
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
s.handle("questions:getAll", async () => await _.getAll());
s.handle("questions:create", async (t, e) => await _.create(e));
s.handle("questions:update", async (t, e, a) => await _.update(e, a));
s.handle("questions:delete", async (t, e) => await _.delete(e));
s.handle("questions:search", async (t, e) => await _.search(e));
s.handle("questions:getByCategory", async (t, e) => await _.getByCategory(e));
const q = {
  getAll: async () => await c.findAll(),
  getById: async (t) => await c.findOne({ where: { option_id: t } }),
  create: async (t) => await c.create(t),
  update: async (t, e) => await c.update(e, { where: { option_id: t } }),
  delete: async (t) => await c.destroy({ where: { option_id: t } })
};
s.handle("options:getAll", async () => await q.getAll());
s.handle("options:create", async (t, e) => await q.create(e));
s.handle("options:update", async (t, e, a) => await q.update(e, a));
s.handle("options:delete", async (t, e) => await q.delete(e));
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
s.handle("categories:getAll", async () => await A.getAll());
s.handle("categories:create", async (t, e) => await A.create(e));
s.handle("categories:update", async (t, e, a) => await A.update(e, a));
s.handle("categories:delete", async (t, e) => await A.delete(e));
s.handle("categories:nameExists", async (t, e, a = null) => await A.nameExists(e, a));
const g = {
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
}, T = {
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
const P = {
  explainQuestion: async (t, e) => {
    throw new Error("Gemini API key is not set.");
  },
  // Método para retroalimentación del examen
  feedbackExam: async (t, e) => {
    throw new Error("Gemini API key is not set.");
  }
};
s.handle("ai:explainQuestion", async (t, e, a) => await P.explainQuestion(e, a));
s.handle("ai:feedbackExam", async (t, e, a) => await P.feedbackExam(e, a));
s.handle("exams:getAll", async () => await g.getAll());
s.handle("exams:getById", async (t, e) => await g.getById(e));
s.handle("exams:create", async (t, e) => await g.create(e));
s.handle("exams:update", async (t, e, a) => await g.update(e, a));
s.handle("exams:delete", async (t, e) => await g.delete(e));
s.handle("exams:getQuestions", async (t, e) => await g.getQuestions(e));
s.handle("exams:addQuestions", async (t, e, a) => await g.addQuestions(e, a));
s.handle("exams:removeQuestions", async (t, e, a) => await g.removeQuestions(e, a));
s.handle("results:getAll", async () => await T.getAll());
s.handle("results:getById", async (t, e) => await T.getById(e));
s.handle("results:create", async (t, e) => await T.create(e));
s.handle("results:delete", async (t, e) => await T.delete(e));
s.handle("results:getByExamId", async (t, e) => await T.getByExamId(e));
const N = {
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
=======
function boldMarkdownToHtml(text) {
  if (!text) return text;
  return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}
const apiKey = "AIzaSyA6XbOUVChgVYbU7TyeC9waui2oX98aX20";
const AIController = {
  // Método para generar preguntas usando Gemini AI
  generateQuestions: async (config) => {
    var _a, _b, _c, _d, _e, _f;
    try {
      console.log("AIController: Iniciando generación de preguntas con Gemini");
      console.log("AIController: Configuración:", config);
      const prompt = `
Eres un profesor experto creando preguntas de examen. Analiza el siguiente texto y genera exactamente ${config.multipleChoice} preguntas de opción múltiple y ${config.trueFalse} preguntas de verdadero/falso.

TEXTO A ANALIZAR:
"${config.text}"

INSTRUCCIONES:
1. Lee y comprende completamente el texto
2. Identifica la materia/categoría principal del contenido (ej: Biología, Historia, Matemáticas, etc.)
3. Genera preguntas que evalúen comprensión, análisis y conocimiento del texto
4. Para preguntas de opción múltiple: incluye 2 a 4 opciones, solo una correcta
5. Para preguntas verdadero/falso: asegúrate que sean claras y verificables

FORMATO DE RESPUESTA (JSON estricto):
{
  "questions": [
    {
      "type": "multiple_choice",
      "text": "Pregunta clara y específica sobre el contenido",
      "category": "Nombre de la materia/categoría identificada",
      "options": [
        {"text": "Opción A (correcta)", "is_correct": true},
        {"text": "Opción B (incorrecta)", "is_correct": false},
        {"text": "Opción C (incorrecta)", "is_correct": false},
        {"text": "Opción D (incorrecta)", "is_correct": false}
      ],
      "correctAnswer": 0,
      "explanation": "Breve explicación de por qué esta respuesta es correcta"
    },
    {
      "type": "true_false",
      "text": "Afirmación clara que se puede evaluar como verdadera o falsa",
      "category": "Nombre de la materia/categoría identificada",
      "correctAnswer": true,
      "explanation": "Breve explicación de por qué esta afirmación es verdadera o falsa"
    }
  ]
}

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional
- Todas las preguntas deben estar basadas en el contenido del texto
- La categoría debe ser consistente y apropiada para el contenido
- Las preguntas deben ser educativas y de calidad académica
- Asegúrate de generar exactamente ${config.multipleChoice} preguntas de opción múltiple y ${config.trueFalse} preguntas de verdadero/falso
      `.trim();
      console.log("AIController: Enviando prompt a Gemini API...");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("AIController: Respuesta recibida de Gemini API");
      const generatedText = (_f = (_e = (_d = (_c = (_b = (_a = data == null ? void 0 : data.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) == null ? void 0 : _f.trim();
      if (!generatedText) {
        throw new Error("No se pudo generar el contenido desde la API");
      }
      console.log("AIController: Texto generado:", generatedText.substring(0, 200) + "...");
      try {
        const cleanedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsedQuestions = JSON.parse(cleanedText);
        if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
          throw new Error("El formato de respuesta de la API no es válido");
        }
        console.log(
          "AIController: Preguntas generadas exitosamente:",
          parsedQuestions.questions.length
        );
        return parsedQuestions;
      } catch (parseError) {
        console.error("AIController: Error parseando JSON:", parseError);
        console.error("AIController: Texto a parsear:", generatedText);
        throw new Error("Error al procesar las preguntas generadas por la API");
      }
    } catch (error) {
      console.error("AIController: Error generando preguntas:", error);
      throw new Error(`Error generating questions: ${error.message}`);
    }
  },
  explainQuestion: async (questionId, optionSelectedId) => {
    var _a, _b, _c, _d, _e, _f;
    let option = {};
    let prompt = "";
    if (optionSelectedId === void 0 || optionSelectedId === null) {
      option.text = "Pregunta no respondida";
      const question = await QuestionController.getById(questionId);
      if (!question) throw new Error("Question not found");
      const correctOption = question.options.find((opt) => opt.is_correct);
      prompt = `
        No saludes, no te presentes, no digas que eres una IA.
        Actúa como un profesor experto en el tema.
        El estudiante no respondió la siguiente pregunta de un examen tipo test.
        No uses latex, escribe símbolos matemáticos de manera simple, usa texto plano para fórmulas.

        Pregunta: ${question.text}
        Opciones: 
        ${question.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}. ${opt.text}`).join("\n")}
        Respuesta correcta: ${correctOption ? correctOption.text : "No disponible"}

        Explica de manera clara y sencilla por qué esta es la respuesta correcta para que el estudiante comprenda el razonamiento.
        También explica por qué las demás respuestas no son correctas.
        Responde en español, de forma muy breve y didáctica.
      `;
    } else {
      option = await OptionController.getById(optionSelectedId);
      const question = await QuestionController.getById(questionId);
      if (!question || !option) throw new Error("Question or option not found");
      prompt = `
        No saludes, no te presentes, no digas que eres una IA.
        Actúa como un profesor experto en el tema.
        No uses latex, escribe símbolos matemáticos de manera simple, usa texto plano para fórmulas.
        Opciones: 
        ${question.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}. ${opt.text}`).join("\n")}
        Respuesta seleccionada: ${option.text}

        Explica si la respuesta es correcta o incorrecta, y justifica la explicación para que el estudiante comprenda el razonamiento.
        También explica por qué las demás respuestas no son correctas.
        Responde en español, de forma muy breve y didáctica.
      `;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      const data = await response.json();
      let text = ((_f = (_e = (_d = (_c = (_b = (_a = data == null ? void 0 : data.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) == null ? void 0 : _f.trim()) || "No se pudo obtener explicación de la IA.";
      text = boldMarkdownToHtml(text);
      return text;
    } catch (err) {
      return `Error al comunicarse con Gemini: ${err.message}`;
    }
  },
  // Método para retroalimentación del examen
  feedbackExam: async (examId, resultId) => {
    var _a, _b, _c, _d, _e, _f;
    const exam = await ExamController.getById(examId);
    const result = await ResultController.getById(resultId);
    if (!exam || !result) throw new Error("Exam or result not found");
    const userAnswers = Array.isArray(result.userAnswers) ? result.userAnswers : [];
    const correctCount = result.correct_answers;
    const incorrectCount = result.incorrect_answers;
    let resumen = "";
    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    questions.forEach((q, idx) => {
      var _a2;
      const options = Array.isArray(q.options) ? q.options : [];
      const userAnswer = userAnswers.find((ua) => ua.question_id === q.question_id);
      const correctOpt = options.find((opt) => opt.is_correct);
      resumen += `Pregunta ${idx + 1}: ${q.text || "Sin texto"}
`;
      resumen += `Opciones: ${options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text || "Sin texto"}${opt.is_correct ? " (correcta)" : ""}`).join(" ")}
`;
      const opcionEscogida = userAnswer ? ((_a2 = options.find((opt) => opt.option_id === userAnswer.option_id)) == null ? void 0 : _a2.text) || "Sin texto" : "No respondida";
      resumen += `Opción escogida: ${opcionEscogida}
`;
      resumen += `Respuesta correcta: ${correctOpt ? correctOpt.text || "Sin texto" : "No disponible"}

`;
    });
    const prompt = `No saludes, no te presentes.
      no digas que eres una IA.
      Actúa como un profesor experto en el tema y en dar retroalimentación de exámenes.
      

Resumen del desempeño:
- Respuestas correctas: ${correctCount}
- Respuestas incorrectas: ${incorrectCount}

${resumen}

      Por favor, da una retroalimentación breve y didáctica sobre el desempeño general del estudiante en este examen, sin explicar cada pregunta.
      Indica en qué aspectos puede mejorar y qué cosas hizo bien.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      const data = await response.json();
      let text = ((_f = (_e = (_d = (_c = (_b = (_a = data == null ? void 0 : data.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) == null ? void 0 : _f.trim()) || "No se pudo obtener retroalimentación de la IA.";
      text = boldMarkdownToHtml(text);
      return text;
    } catch (err) {
      return `Error al comunicarse con Gemini: ${err.message}`;
    }
  }
};
ipcMain.handle("ai:extractPdfText", async (_, pdfBuffer) => {
  try {
    console.log("AI IPC: Recibida solicitud de extracción de PDF, buffer size:", pdfBuffer.byteLength);
    const result = await AIController.extractPdfText(pdfBuffer);
    console.log("AI IPC: Extracción completada exitosamente");
    return result;
  } catch (error) {
    console.error("AI IPC: Error en extracción de PDF:", error);
    throw error;
  }
});
ipcMain.handle("ai:generateQuestionsFromPDF", async (_, { pdfBuffer, config }) => {
  return await AIController.generateQuestionsFromPDF(pdfBuffer, config);
});
ipcMain.handle("ai:generateQuestions", async (_, config) => {
  try {
    console.log("AI IPC: Recibida solicitud de generación de preguntas:", config);
    const result = await AIController.generateQuestions(config);
    console.log("AI IPC: Generación de preguntas completada exitosamente");
    return result;
  } catch (error) {
    console.error("AI IPC: Error en generación de preguntas:", error);
    throw error;
  }
});
ipcMain.handle("ai:explainQuestion", async (_, questionId, optionSelectedId) => {
  return await AIController.explainQuestion(questionId, optionSelectedId);
});
ipcMain.handle("ai:feedbackExam", async (_, examId, resultId) => {
  return await AIController.feedbackExam(examId, resultId);
});
ipcMain.handle("exams:getAll", async () => {
  return await ExamController.getAll();
});
ipcMain.handle("exams:getById", async (_, id) => {
  return await ExamController.getById(id);
});
ipcMain.handle("exams:create", async (_, data) => {
  return await ExamController.create(data);
});
ipcMain.handle("exams:update", async (_, id, data) => {
  return await ExamController.update(id, data);
});
ipcMain.handle("exams:delete", async (_, id) => {
  return await ExamController.delete(id);
});
ipcMain.handle("exams:getQuestions", async (_, examId) => {
  return await ExamController.getQuestions(examId);
});
ipcMain.handle("exams:addQuestions", async (_, examId, questionIds) => {
  return await ExamController.addQuestions(examId, questionIds);
});
ipcMain.handle("exams:removeQuestions", async (_, examId, questionIds) => {
  return await ExamController.removeQuestions(examId, questionIds);
});
ipcMain.handle("results:getAll", async () => {
  return await ResultController.getAll();
});
ipcMain.handle("results:getById", async (event, id) => {
  return await ResultController.getById(id);
});
ipcMain.handle("results:create", async (event, data) => {
  return await ResultController.create(data);
});
ipcMain.handle("results:delete", async (event, id) => {
  return await ResultController.delete(id);
});
ipcMain.handle("results:getByExamId", async (event, examId) => {
  return await ResultController.getByExamId(examId);
});
const UserAnswerController = {
  getAll: async () => {
    return await UserAnswer.findAll({ include: ["result", "question", "option"] });
  },
  getById: async (resultId, questionId) => {
    return await UserAnswer.findOne({
      where: { result_id: resultId, question_id: questionId },
      include: ["result", "question", "option"]
    });
  },
  create: async (data) => {
    const option = await Option.findByPk(data.optionId);
    if (!option) throw new Error("Option not found");
    const isCorrect = !!option.is_correct;
    return await UserAnswer.create({
      result_id: data.resultId,
      question_id: data.questionId,
      option_id: data.optionId,
      is_correct: isCorrect
    });
  },
  delete: async (t, e) => await y.destroy({ where: { result_id: t, question_id: e } })
};
s.handle("userAnswers:getAll", async () => await N.getAll());
s.handle("userAnswers:getById", async (t, e, a) => await N.getById(e, a));
s.handle("userAnswers:create", async (t, e) => await N.create(e));
s.handle("userAnswers:delete", async (t, e, a) => await N.delete(e, a));
const b = E.dirname(D(import.meta.url));
process.env.APP_ROOT = E.join(b, "..");
const I = process.env.VITE_DEV_SERVER_URL, W = E.join(process.env.APP_ROOT, "dist-electron"), Q = E.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = I ? E.join(process.env.APP_ROOT, "public") : Q;
let p = null;
function k() {
  p = new O({
    icon: E.join(process.env.VITE_PUBLIC, "Logo.png"),
    webPreferences: {
      preload: E.join(b, "preload.mjs")
    }
  }), p.webContents.on("did-finish-load", () => {
    p == null || p.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), I ? p.loadURL(I) : p.loadFile(E.join(Q, "index.html"));
=======
ipcMain.handle("userAnswers:getAll", async () => {
  return await UserAnswerController.getAll();
});
ipcMain.handle("userAnswers:getById", async (event, resultId, questionId) => {
  return await UserAnswerController.getById(resultId, questionId);
});
ipcMain.handle("userAnswers:create", async (event, data) => {
  return await UserAnswerController.create(data);
});
ipcMain.handle("userAnswers:delete", async (event, resultId, questionId) => {
  return await UserAnswerController.delete(resultId, questionId);
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
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    show: false,
    // Don't show until ready-to-show
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      // Disable features that cause DevTools errors
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: "default",
    frame: true,
    resizable: true,
    maximizable: true,
    autoHideMenuBar: false
    // Keep menu bar visible
  });
  win.once("ready-to-show", () => {
    win.show();
    win.focus();
  });
  win.on("blur", () => {
  });
  win.on("focus", () => {
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("console-message", (event, level, message, line, sourceId) => {
    const suppressedMessages = [
      "Autofill.enable",
      "wasn't found",
      "protocol_client.js",
      "Request Autofill.enable failed"
    ];
    if (suppressedMessages.some((suppressed) => message.includes(suppressed))) ;
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
h.on("window-all-closed", () => {
  process.platform !== "darwin" && (h.quit(), p = null);
});
h.on("activate", () => {
  O.getAllWindows().length === 0 && k();
=======
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    if (win && !win.isDestroyed()) {
      win.show();
      win.focus();
    }
  }
});
h.whenReady().then(async () => {
  try {
    await n.authenticate(), console.log("Database connection established.");
  } catch (t) {
    console.error("Error connecting to the database:", t), h.quit();
    return;
  }
  k();
});
export {
  W as MAIN_DIST,
  Q as RENDERER_DIST,
  I as VITE_DEV_SERVER_URL
};
