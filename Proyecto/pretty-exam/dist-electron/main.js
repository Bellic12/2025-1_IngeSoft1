import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { Sequelize, DataTypes, Op } from "sequelize";
import path, { join } from "path";
import path$1 from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: join(__dirname$1, "..", "pretty_exam.db"),
  logging: false
});
const Category = sequelize.define(
  "Category",
  {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },
  {
    tableName: "Category",
    timestamps: false
  }
);
Category.associate = () => {
  Category.hasMany(Question, {
    foreignKey: "category_id",
    as: "questions"
  });
};
const Option = sequelize.define(
  "Option",
  {
    option_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false }
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
    timestamps: false
  }
);
Option.associate = () => {
  Option.belongsTo(Question, {
    foreignKey: "question_id",
    as: "question"
  });
};
const Exam = sequelize.define(
  "Exam",
  {
    exam_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true, validate: { isInt: true } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
  },
  {
    tableName: "Exam",
    timestamps: false
  }
);
Exam.associate = () => {
  Exam.belongsToMany(Question, {
    through: "ExamQuestion",
    foreignKey: "exam_id",
    otherKey: "question_id",
    timestamps: false,
    as: "questions",
    onDelete: "CASCADE"
  });
};
const Question = sequelize.define(
  "Question",
  {
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
    timestamps: false
  }
);
Question.associate = () => {
  Question.hasMany(Option, {
    foreignKey: "question_id",
    onDelete: "CASCADE",
    as: "options"
  });
  Question.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
  });
  Question.belongsToMany(Exam, {
    through: "ExamQuestion",
    foreignKey: "question_id",
    otherKey: "exam_id",
    timestamps: false,
    as: "exams",
    onDelete: "CASCADE"
  });
};
const UserAnswer = sequelize.define(
  "UserAnswer",
  {
    result_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    question_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    option_id: { type: DataTypes.INTEGER, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: false }
  },
  {
    tableName: "UserAnswer",
    timestamps: false
  }
);
UserAnswer.associate = () => {
  UserAnswer.belongsTo(Result, { foreignKey: "result_id", as: "result", onDelete: "CASCADE" });
  UserAnswer.belongsTo(Question, { foreignKey: "question_id", as: "question", onDelete: "CASCADE" });
  UserAnswer.belongsTo(Option, { foreignKey: "option_id", as: "option", onDelete: "CASCADE" });
};
const Result = sequelize.define(
  "Result",
  {
    result_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 100 } },
    correct_answers: { type: DataTypes.INTEGER, allowNull: false },
    incorrect_answers: { type: DataTypes.INTEGER, allowNull: false },
    time_used: { type: DataTypes.INTEGER, allowNull: false },
    taken_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
  },
  {
    tableName: "Result",
    timestamps: false
  }
);
Result.associate = () => {
  Result.belongsTo(Exam, {
    foreignKey: "exam_id",
    as: "exam",
    onDelete: "CASCADE"
  });
  Result.hasMany(UserAnswer, {
    foreignKey: "result_id",
    as: "userAnswers",
    onDelete: "CASCADE"
  });
};
Question.associate && Question.associate();
Option.associate && Option.associate();
Category.associate && Category.associate();
Exam.associate && Exam.associate();
Result.associate && Result.associate();
UserAnswer.associate && UserAnswer.associate();
const QuestionController = {
  getAll: async () => {
    const questions = await Question.findAll({
      include: [
        { model: Option, as: "options" },
        { model: Category, as: "category" }
      ]
    });
    return questions.map((q) => q.get({ plain: true }));
  },
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
  update: async (id, data) => {
    var _a;
    const t = await sequelize.transaction();
    try {
      if (data.category_id) {
        const categoryExists = await Category.findByPk(data.category_id, { transaction: t });
        if (!categoryExists) {
          await t.rollback();
          console.error(`Category with ID ${data.category_id} does not exist`);
          throw new Error("CATEGORY_NOT_FOUND");
        }
      }
      const existingQuestion = await Question.findByPk(id, { transaction: t });
      if (!existingQuestion) {
        await t.rollback();
        console.error(`Question with ID ${id} does not exist`);
        throw new Error("QUESTION_NOT_FOUND");
      }
      await sequelize.query("PRAGMA foreign_keys = OFF", {
        transaction: t,
        type: sequelize.QueryTypes.RAW
      });
      const existingOptions = await sequelize.query(
        "SELECT option_id FROM `Option` WHERE `question_id` = ?",
        {
          replacements: [id],
          transaction: t,
          type: sequelize.QueryTypes.SELECT
        }
      );
      if (existingOptions.length > 0) {
        const optionIds = existingOptions.map((opt) => opt.option_id);
        await sequelize.query(
          `DELETE FROM \`UserAnswer\` WHERE \`option_id\` IN (${optionIds.map(() => "?").join(",")})`,
          {
            replacements: optionIds,
            transaction: t,
            type: sequelize.QueryTypes.DELETE
          }
        );
      }
      await sequelize.query("DELETE FROM `Option` WHERE `question_id` = ?", {
        replacements: [id],
        transaction: t,
        type: sequelize.QueryTypes.DELETE
      });
      await Question.update(
        {
          text: data.text,
          type: data.type,
          category_id: data.category_id
        },
        { where: { question_id: id }, transaction: t }
      );
      if (data.options && data.options.length > 0) {
        for (const opt of data.options) {
          await Option.create(
            {
              text: opt.text,
              is_correct: opt.is_correct,
              question_id: id
            },
            { transaction: t }
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
      let whereClause = {};
      if (categoryIds && categoryIds.length > 0) {
        whereClause.category_id = {
          [Op.in]: categoryIds
        };
      }
      if (searchTerm && searchTerm.trim()) {
        const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
        const searchConditions = [];
        searchConditions.push({
          text: sequelize.where(
            sequelize.fn(
              "LOWER",
              sequelize.fn(
                "REPLACE",
                sequelize.fn(
                  "REPLACE",
                  sequelize.fn(
                    "REPLACE",
                    sequelize.fn(
                      "REPLACE",
                      sequelize.fn("REPLACE", sequelize.col("Question.text"), "á", "a"),
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
            `%${normalizedSearchTerm}%`
          )
        });
        if (!categoryIds || categoryIds.length === 0) {
          searchConditions.push(
            sequelize.where(
              sequelize.fn(
                "LOWER",
                sequelize.fn(
                  "REPLACE",
                  sequelize.fn(
                    "REPLACE",
                    sequelize.fn(
                      "REPLACE",
                      sequelize.fn(
                        "REPLACE",
                        sequelize.fn("REPLACE", sequelize.col("category.name"), "á", "a"),
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
              `%${normalizedSearchTerm}%`
            )
          );
        }
        const searchClause = { [Op.or]: searchConditions };
        if (Object.keys(whereClause).length > 0) {
          whereClause = {
            [Op.and]: [whereClause, searchClause]
          };
        } else {
          whereClause = searchClause;
        }
      }
      const questions = await Question.findAll({
        where: whereClause,
        include: [
          { model: Option, as: "options" },
          { model: Category, as: "category" }
        ],
        order: [["question_id", "DESC"]]
      });
      return questions.map((q) => q.get({ plain: true }));
    } catch (error) {
      console.error("Error in question search:", error);
      return [];
    }
  },
  getByCategory: async (categoryId) => {
    const questions = await Question.findAll({
      where: { category_id: categoryId },
      include: [
        { model: Option, as: "options" },
        { model: Category, as: "category" }
      ],
      order: [["question_id", "DESC"]]
    });
    return questions.map((q) => q.get({ plain: true }));
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
ipcMain.handle("questions:search", async (_, filters) => {
  return await QuestionController.search(filters);
});
ipcMain.handle("questions:getByCategory", async (_, categoryId) => {
  return await QuestionController.getByCategory(categoryId);
});
const OptionController = {
  getAll: async () => {
    return await Option.findAll();
  },
  getById: async (id) => {
    return await Option.findOne({ where: { option_id: id } });
  },
  create: async (data) => {
    return await Option.create(data);
  },
  update: async (id, data) => {
    return await Option.update(data, { where: { option_id: id } });
  },
  delete: async (id) => {
    return await Option.destroy({ where: { option_id: id } });
  }
};
ipcMain.handle("options:getAll", async () => {
  return await OptionController.getAll();
});
ipcMain.handle("options:create", async (_, data) => {
  return await OptionController.create(data);
});
ipcMain.handle("options:update", async (_, id, data) => {
  return await OptionController.update(id, data);
});
ipcMain.handle("options:delete", async (_, id) => {
  return await OptionController.delete(id);
});
const CategoryController = {
  // Get all categories
  getAll: async () => {
    const categories = await Category.findAll({
      order: [["name", "ASC"]]
    });
    return categories.map((c) => c.get({ plain: true }));
  },
  // Create a new category
  create: async (data) => {
    try {
      const category = await Category.create({
        name: data.name
      });
      return category.get({ plain: true });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Category name already exists");
      }
      throw error;
    }
  },
  // Update an existing category
  update: async (id, data) => {
    try {
      const [updatedRowsCount] = await Category.update(
        { name: data.name },
        { where: { category_id: id } }
      );
      if (updatedRowsCount === 0) {
        throw new Error("Category not found");
      }
      const updatedCategory = await Category.findByPk(id);
      return updatedCategory.get({ plain: true });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Category name already exists");
      }
      throw error;
    }
  },
  // Delete a category
  delete: async (id) => {
    const deletedRowsCount = await Category.destroy({
      where: { category_id: id }
    });
    if (deletedRowsCount === 0) {
      throw new Error("Category not found");
    }
    return true;
  },
  // Check if category name exists
  nameExists: async (name, excludeId = null) => {
    const whereClause = { name };
    if (excludeId) {
      whereClause.category_id = { [Category.sequelize.Op.ne]: excludeId };
    }
    const category = await Category.findOne({ where: whereClause });
    return !!category;
  }
};
ipcMain.handle("categories:getAll", async () => {
  return await CategoryController.getAll();
});
ipcMain.handle("categories:create", async (_, data) => {
  return await CategoryController.create(data);
});
ipcMain.handle("categories:update", async (_, id, data) => {
  return await CategoryController.update(id, data);
});
ipcMain.handle("categories:delete", async (_, id) => {
  return await CategoryController.delete(id);
});
ipcMain.handle("categories:nameExists", async (_, name, excludeId = null) => {
  return await CategoryController.nameExists(name, excludeId);
});
const ExamController = {
  // Get all exams with associated questions
  getAll: async () => {
    const exams = await Exam.findAll({
      include: [{ model: Question, as: "questions" }]
    });
    return exams.map((e) => e.get({ plain: true }));
  },
  // Get an exam by ID with associated questions and their options
  getById: async (id) => {
    const exam = await Exam.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
          include: [{ model: Option, as: "options" }]
        }
      ]
    });
    return exam ? exam.get({ plain: true }) : null;
  },
  // Create a new exam with associated questions
  create: async (data) => {
    const t = await sequelize.transaction();
    try {
      const exam = await Exam.create(
        {
          name: data.name,
          description: data.description,
          duration_minutes: data.duration_minutes
        },
        { transaction: t }
      );
      if (data.question_ids && data.question_ids.length > 0) {
        await exam.setQuestions(data.question_ids, { transaction: t });
      }
      await t.commit();
      return exam;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  // Update an existing exam and its associated questions
  update: async (id, data) => {
    const t = await sequelize.transaction();
    try {
      await Exam.update(
        {
          name: data.name,
          description: data.description,
          duration_minutes: data.duration_minutes
        },
        { where: { exam_id: id }, transaction: t }
      );
      if (data.question_ids && data.question_ids.length > 0) {
        const exam = await Exam.findByPk(id, { transaction: t });
        await exam.setQuestions(data.question_ids, { transaction: t });
      }
      await t.commit();
      return { message: "Exam updated successfully" };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  // Delete an exam by ID
  delete: async (id) => {
    const t = await sequelize.transaction();
    try {
      const result = await Exam.destroy({
        where: { exam_id: id },
        transaction: t
      });
      await t.commit();
      return result > 0 ? { message: "Exam deleted successfully" } : null;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  // Get questions associated with an exam
  getQuestions: async (examId) => {
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            { model: Category, as: "category" },
            { model: Option, as: "options" }
          ]
        }
      ]
    });
    return exam ? exam.questions.map((q) => q.get({ plain: true })) : [];
  },
  // Add questions to an exam
  addQuestions: async (examId, questionIds) => {
    const t = await sequelize.transaction();
    try {
      const exam = await Exam.findByPk(examId, { transaction: t });
      if (!exam) throw new Error("Exam not found");
      const questions = await Question.findAll({
        where: { question_id: questionIds },
        transaction: t
      });
      await exam.addQuestions(questions, { transaction: t });
      await t.commit();
      return { message: "Questions added successfully" };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  // Remove questions from an exam
  removeQuestions: async (examId, questionIds) => {
    const t = await sequelize.transaction();
    try {
      const exam = await Exam.findByPk(examId, { transaction: t });
      if (!exam) throw new Error("Exam not found");
      const questions = await Question.findAll({
        where: { question_id: questionIds },
        transaction: t
      });
      await exam.removeQuestions(questions, { transaction: t });
      await t.commit();
      return { message: "Questions removed successfully" };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
};
const ResultController = {
  getAll: async () => {
    const results = await Result.findAll({
      include: [
        { model: Exam, as: "exam" },
        { model: UserAnswer, as: "userAnswers", include: [{ model: Option, as: "option" }] }
      ]
    });
    return results.map((e) => e.get({ plain: true }));
  },
  getByExamId: async (examId) => {
    const results = await Result.findAll({
      where: { exam_id: examId },
      order: [["taken_at", "DESC"]]
    });
    return results.map((e) => e.get({ plain: true }));
  },
  getById: async (id) => {
    const result = await Result.findByPk(id, {
      include: [
        { model: Exam, as: "exam" },
        { model: UserAnswer, as: "userAnswers", include: [{ model: Option, as: "option" }] }
      ]
    });
    return result ? result.get({ plain: true }) : null;
  },
  create: async (data) => {
    const result = await Result.create({
      exam_id: data.exam_id,
      score: data.score,
      correct_answers: data.correct_answers,
      incorrect_answers: data.incorrect_answers,
      time_used: data.time_used,
      taken_at: /* @__PURE__ */ new Date()
    });
    return result.get({ plain: true });
  },
  delete: async (id) => {
    return await Result.destroy({ where: { result_id: id } });
  }
};
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
  delete: async (resultId, questionId) => {
    return await UserAnswer.destroy({ where: { result_id: resultId, question_id: questionId } });
  }
};
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
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
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
