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
    source: { type: DataTypes.STRING, defaultValue: "manual", allowNull: true },
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
const validateQuestion = (questionData) => {
  const errors = [];
  if (!questionData) {
    return {
      isValid: false,
      errors: ["Los datos de la pregunta son requeridos"]
    };
  }
  const { text, type, category_id: categoryId, options } = questionData;
  if (!text || typeof text !== "string") {
    errors.push("El texto de la pregunta es requerido");
  } else {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      errors.push("El texto de la pregunta no puede estar vacío");
    } else if (trimmedText.length < 10) {
      errors.push("El texto de la pregunta debe tener al menos 10 caracteres");
    } else if (trimmedText.length > 1e3) {
      errors.push("El texto de la pregunta no puede exceder 1000 caracteres");
    }
  }
  const validTypes = ["multiple_choice", "true_false"];
  if (!type || typeof type !== "string") {
    errors.push("El tipo de pregunta es requerido");
  } else if (!validTypes.includes(type)) {
    errors.push('El tipo de pregunta debe ser "multiple_choice" o "true_false"');
  }
  if (categoryId !== null && categoryId !== void 0) {
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      errors.push("El ID de categoría debe ser un número entero positivo");
    }
  }
  if (!options || !Array.isArray(options)) {
    errors.push("Las opciones son requeridas y deben ser un array");
  } else {
    const optionErrors = validateOptions(options, type);
    errors.push(...optionErrors);
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const validateOptions = (options, type) => {
  const errors = [];
  if (options.length === 0) {
    errors.push("Debe haber al menos una opción");
    return errors;
  }
  if (type === "multiple_choice") {
    if (options.length < 2) {
      errors.push("Las preguntas de opción múltiple deben tener al menos 2 opciones");
    } else if (options.length > 6) {
      errors.push("Las preguntas de opción múltiple no pueden tener más de 6 opciones");
    }
  } else if (type === "true_false") {
    if (options.length !== 2) {
      errors.push("Las preguntas de verdadero/falso deben tener exactamente 2 opciones");
    }
  }
  options.forEach((option, index) => {
    if (!option || typeof option !== "object") {
      errors.push(`La opción ${index + 1} debe ser un objeto válido`);
      return;
    }
    const { text, isCorrect } = option;
    if (!text || typeof text !== "string") {
      errors.push(`El texto de la opción ${index + 1} es requerido`);
    } else {
      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        errors.push(`El texto de la opción ${index + 1} no puede estar vacío`);
      } else if (trimmedText.length > 500) {
        errors.push(`El texto de la opción ${index + 1} no puede exceder 500 caracteres`);
      }
    }
    if (typeof isCorrect !== "boolean") {
      errors.push(`La propiedad isCorrect de la opción ${index + 1} debe ser un booleano`);
    }
  });
  const correctOptions = options.filter((option) => option.isCorrect === true);
  if (correctOptions.length === 0) {
    errors.push("Debe haber al menos una opción correcta");
  }
  if (type === "true_false" && correctOptions.length !== 1) {
    errors.push("Las preguntas de verdadero/falso deben tener exactamente una opción correcta");
  }
  const optionTexts = options.map((opt) => {
    var _a;
    return (_a = opt.text) == null ? void 0 : _a.trim().toLowerCase();
  }).filter(Boolean);
  const uniqueTexts = new Set(optionTexts);
  if (optionTexts.length !== uniqueTexts.size) {
    errors.push("No puede haber opciones con el mismo texto");
  }
  return errors;
};
const validateQuestionUpdate = (updateData) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ["Debe proporcionar al menos un campo para actualizar"]
    };
  }
  const errors = [];
  if (updateData.text !== void 0) {
    if (!updateData.text || typeof updateData.text !== "string") {
      errors.push("El texto de la pregunta es requerido");
    } else {
      const trimmedText = updateData.text.trim();
      if (trimmedText.length === 0) {
        errors.push("El texto de la pregunta no puede estar vacío");
      } else if (trimmedText.length < 10) {
        errors.push("El texto de la pregunta debe tener al menos 10 caracteres");
      } else if (trimmedText.length > 1e3) {
        errors.push("El texto de la pregunta no puede exceder 1000 caracteres");
      }
    }
  }
  if (updateData.type !== void 0) {
    const validTypes = ["multiple_choice", "true_false"];
    if (!updateData.type || typeof updateData.type !== "string") {
      errors.push("El tipo de pregunta es requerido");
    } else if (!validTypes.includes(updateData.type)) {
      errors.push('El tipo de pregunta debe ser "multiple_choice" o "true_false"');
    }
  }
  if (updateData.category_id !== void 0 && updateData.category_id !== null) {
    if (!Number.isInteger(updateData.category_id) || updateData.category_id <= 0) {
      errors.push("El ID de categoría debe ser un número entero positivo");
    }
  }
  if (updateData.options !== void 0) {
    if (!updateData.options || !Array.isArray(updateData.options)) {
      errors.push("Las opciones deben ser un array");
    } else {
      const type = updateData.type || "multiple_choice";
      const optionErrors = validateOptions(updateData.options, type);
      errors.push(...optionErrors);
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const validateQuestionId = (questionId) => {
  const errors = [];
  if (questionId === null || questionId === void 0) {
    errors.push("El ID de la pregunta es requerido");
  } else if (!Number.isInteger(Number(questionId)) || Number(questionId) <= 0) {
    errors.push("El ID de la pregunta debe ser un número entero positivo");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
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
  create: async (data) => {
    const validation = validateQuestion(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
    const t = await sequelize.transaction();
    try {
      const question = await Question.create(
        {
          text: data.text,
          type: data.type,
          category_id: data.category_id
        },
        { transaction: t }
      );
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
      await t.commit();
      return question;
    } catch (err) {
      await t.rollback();
      if (err.message === "VALIDATION_ERROR") {
        throw err;
      }
      throw err;
    }
  },
  update: async (id, data) => {
    var _a;
    const idValidation = validateQuestionId(id);
    if (!idValidation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = idValidation.errors;
      throw error;
    }
    const validation = validateQuestionUpdate(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
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
      if (err.message === "VALIDATION_ERROR") {
        throw err;
      }
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
  try {
    return await QuestionController.create(data);
  } catch (error) {
    console.error("Error creating question:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const createError = new Error("Error al crear la pregunta");
    createError.type = "CREATE_ERROR";
    throw createError;
  }
});
ipcMain.handle("questions:update", async (_, id, data) => {
  try {
    return await QuestionController.update(id, data);
  } catch (error) {
    console.error("Error updating question:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const updateError = new Error("Error al actualizar la pregunta");
    updateError.type = "UPDATE_ERROR";
    throw updateError;
  }
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
const validateCategory = (categoryData) => {
  const errors = [];
  if (!categoryData) {
    return {
      isValid: false,
      errors: ["Los datos de la categoría son requeridos"]
    };
  }
  const { name } = categoryData;
  if (!name || typeof name !== "string") {
    errors.push("El nombre de la categoría es requerido");
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      errors.push("El nombre de la categoría no puede estar vacío");
    } else if (trimmedName.length < 2) {
      errors.push("El nombre de la categoría debe tener al menos 2 caracteres");
    } else if (trimmedName.length > 100) {
      errors.push("El nombre de la categoría no puede exceder 100 caracteres");
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\d\-_().]+$/;
    if (!nameRegex.test(trimmedName)) {
      errors.push("El nombre de la categoría contiene caracteres no permitidos");
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const validateCategoryUpdate = (updateData) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ["Debe proporcionar al menos un campo para actualizar"]
    };
  }
  if (updateData.name) {
    return validateCategory(updateData);
  }
  return {
    isValid: false,
    errors: ["No hay campos válidos para actualizar"]
  };
};
const validateCategoryId = (categoryId) => {
  const errors = [];
  if (categoryId === null || categoryId === void 0) {
    errors.push("El ID de la categoría es requerido");
  } else if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
    errors.push("El ID de la categoría debe ser un número entero positivo");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const validateCategoryNameUniqueness = (name, existingCategories = [], excludeId = null) => {
  const errors = [];
  if (!name || typeof name !== "string") {
    errors.push("El nombre es requerido para validar unicidad");
    return {
      isValid: false,
      errors
    };
  }
  const trimmedName = name.trim().toLowerCase();
  const duplicateCategory = existingCategories.find((category) => {
    var _a;
    const categoryName = (_a = category.name) == null ? void 0 : _a.trim().toLowerCase();
    const isDifferentCategory = excludeId ? category.category_id !== excludeId : true;
    return categoryName === trimmedName && isDifferentCategory;
  });
  if (duplicateCategory) {
    errors.push("Ya existe una categoría con este nombre");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
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
    const validation = validateCategory(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
    const existingCategories = await Category.findAll();
    const uniquenessValidation = validateCategoryNameUniqueness(
      data.name,
      existingCategories.map((cat) => cat.get({ plain: true }))
    );
    if (!uniquenessValidation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = uniquenessValidation.errors;
      throw error;
    }
    try {
      const category = await Category.create({
        name: data.name.trim()
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
    const idValidation = validateCategoryId(id);
    if (!idValidation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = idValidation.errors;
      throw error;
    }
    const validation = validateCategoryUpdate(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
    const existingCategories = await Category.findAll({
      where: {
        category_id: { [Category.sequelize.Op.ne]: id }
      }
    });
    const uniquenessValidation = validateCategoryNameUniqueness(
      data.name,
      existingCategories.map((cat) => cat.get({ plain: true }))
    );
    if (!uniquenessValidation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = uniquenessValidation.errors;
      throw error;
    }
    try {
      const [updatedRowsCount] = await Category.update(
        { name: data.name.trim() },
        { where: { category_id: id } }
      );
      if (updatedRowsCount === 0) {
        throw new Error("Category not found");
      }
      const updatedCategory = await Category.findByPk(id);
      return updatedCategory.get({ plain: true });
    } catch (error) {
      if (error.message === "VALIDATION_ERROR") {
        throw error;
      }
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
  try {
    return await CategoryController.create(data);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const createError = new Error("Error al crear la categoría");
    createError.type = "CREATE_ERROR";
    throw createError;
  }
});
ipcMain.handle("categories:update", async (_, id, data) => {
  try {
    return await CategoryController.update(id, data);
  } catch (error) {
    console.error("Error updating category:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const updateError = new Error("Error al actualizar la categoría");
    updateError.type = "UPDATE_ERROR";
    throw updateError;
  }
});
ipcMain.handle("categories:delete", async (_, id) => {
  return await CategoryController.delete(id);
});
ipcMain.handle("categories:nameExists", async (_, name, excludeId = null) => {
  return await CategoryController.nameExists(name, excludeId);
});
const validateExam = (examData) => {
  const errors = [];
  if (!examData) {
    return {
      isValid: false,
      errors: ["Los datos del examen son requeridos"]
    };
  }
  const { name, description, duration_minutes: durationMinutes } = examData;
  if (!name || typeof name !== "string") {
    errors.push("El nombre del examen es requerido");
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      errors.push("El nombre del examen no puede estar vacío");
    } else if (trimmedName.length < 3) {
      errors.push("El nombre del examen debe tener al menos 3 caracteres");
    } else if (trimmedName.length > 200) {
      errors.push("El nombre del examen no puede exceder 200 caracteres");
    }
  }
  if (description !== null && description !== void 0) {
    if (typeof description !== "string") {
      errors.push("La descripción debe ser una cadena de texto");
    } else if (description.trim().length > 1e3) {
      errors.push("La descripción no puede exceder 1000 caracteres");
    }
  }
  if (durationMinutes !== null && durationMinutes !== void 0) {
    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration)) {
      errors.push("La duración debe ser un número entero");
    } else if (duration <= 0) {
      errors.push("La duración debe ser mayor a 0 minutos");
    } else if (duration > 1440) {
      errors.push("La duración no puede exceder 1440 minutos (24 horas)");
    } else if (duration < 5) {
      errors.push("La duración debe ser de al menos 5 minutos");
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const validateExamUpdate = (updateData) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      isValid: false,
      errors: ["Debe proporcionar al menos un campo para actualizar"]
    };
  }
  const validationData = {
    name: updateData.name || "Examen temporal",
    // Valor por defecto para validación
    description: updateData.description,
    duration_minutes: updateData.duration_minutes
  };
  if (!updateData.name) {
    const partialErrors = [];
    if (updateData.description !== void 0) {
      if (updateData.description !== null && typeof updateData.description !== "string") {
        partialErrors.push("La descripción debe ser una cadena de texto");
      } else if (updateData.description && updateData.description.trim().length > 1e3) {
        partialErrors.push("La descripción no puede exceder 1000 caracteres");
      }
    }
    if (updateData.duration_minutes !== void 0) {
      if (updateData.duration_minutes !== null) {
        const duration = Number(updateData.duration_minutes);
        if (!Number.isInteger(duration)) {
          partialErrors.push("La duración debe ser un número entero");
        } else if (duration <= 0) {
          partialErrors.push("La duración debe ser mayor a 0 minutos");
        } else if (duration > 1440) {
          partialErrors.push("La duración no puede exceder 1440 minutos (24 horas)");
        } else if (duration < 5) {
          partialErrors.push("La duración debe ser de al menos 5 minutos");
        }
      }
    }
    return {
      isValid: partialErrors.length === 0,
      errors: partialErrors
    };
  }
  return validateExam(validationData);
};
const validateExamId = (examId) => {
  const errors = [];
  if (examId === null || examId === void 0) {
    errors.push("El ID del examen es requerido");
  } else if (!Number.isInteger(Number(examId)) || Number(examId) <= 0) {
    errors.push("El ID del examen debe ser un número entero positivo");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
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
    const validation = validateExam(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
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
      if (err.message === "VALIDATION_ERROR") {
        throw err;
      }
      throw err;
    }
  },
  // Update an existing exam and its associated questions
  update: async (id, data) => {
    const idValidation = validateExamId(id);
    if (!idValidation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = idValidation.errors;
      throw error;
    }
    const validation = validateExamUpdate(data);
    if (!validation.isValid) {
      const error = new Error("VALIDATION_ERROR");
      error.fields = validation.errors;
      throw error;
    }
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
      if (err.message === "VALIDATION_ERROR") {
        throw err;
      }
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
{
  console.log("Gemini API key is not set.");
}
const AIController = {
  explainQuestion: async (questionId, optionSelectedId) => {
    {
      throw new Error("Gemini API key is not set.");
    }
  },
  // Método para retroalimentación del examen
  feedbackExam: async (examId, resultId) => {
    {
      throw new Error("Gemini API key is not set.");
    }
  }
};
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
  try {
    return await ExamController.create(data);
  } catch (error) {
    console.error("Error creating exam:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const createError = new Error("Error al crear el examen");
    createError.type = "CREATE_ERROR";
    throw createError;
  }
});
ipcMain.handle("exams:update", async (_, id, data) => {
  try {
    return await ExamController.update(id, data);
  } catch (error) {
    console.error("Error updating exam:", error);
    if (error.message === "VALIDATION_ERROR") {
      const validationError = new Error(error.fields[0]);
      validationError.type = "VALIDATION_ERROR";
      validationError.allErrors = error.fields;
      throw validationError;
    }
    const updateError = new Error("Error al actualizar el examen");
    updateError.type = "UPDATE_ERROR";
    throw updateError;
  }
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
