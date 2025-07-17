import Question from './question.model.js'
import Option from './option.model.js'
import Category from './category.model.js'
import Exam from './exam.model.js'
import Result from './result.model.js'
import UserAnswer from './userAnswer.model.js'

Question.associate && Question.associate()
Option.associate && Option.associate()
Category.associate && Category.associate()
Exam.associate && Exam.associate()
Result.associate && Result.associate()
UserAnswer.associate && UserAnswer.associate()

export { Question, Option, Category, Exam, Result, UserAnswer }
