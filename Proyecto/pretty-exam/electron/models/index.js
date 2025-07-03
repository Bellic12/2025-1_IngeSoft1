import Question from './question.model.js'
import Option from './option.model.js'
import Category from './category.model.js'
import Exam from './exam.model.js'

Question.associate && Question.associate()
Option.associate && Option.associate()
Category.associate && Category.associate()
Exam.associate && Exam.associate()

export { Question, Option, Category, Exam }
