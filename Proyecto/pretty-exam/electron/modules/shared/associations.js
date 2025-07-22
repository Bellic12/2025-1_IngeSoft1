import Question from '../questions/question.model.js'
import Option from './option.model.js'
import Category from '../categories/category.model.js'
import Exam from '../exams/exam.model.js'
import Result from '../results/result.model.js'
import UserAnswer from './userAnswer.model.js'

Question.associate && Question.associate()
Option.associate && Option.associate()
Category.associate && Category.associate()
Exam.associate && Exam.associate()
Result.associate && Result.associate()
UserAnswer.associate && UserAnswer.associate()

export { Question, Option, Category, Exam, Result, UserAnswer }
