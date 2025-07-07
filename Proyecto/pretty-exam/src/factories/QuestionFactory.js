class QuestionFactory {
  static createQuestion(type, data) {
    switch (type) {
      case 'multiple_choice':
        return new MultipleChoiceQuestion(data)
      case 'true_false':
        return new TrueFalseQuestion(data)
      default:
        throw new Error(`Unknown question type: ${type}`)
    }
  }
}

class MultipleChoiceQuestion {
  constructor(data) {
    this.text = data.text
    this.type = 'multiple_choice'
    this.category_id = data.category_id || 1
    this.options = data.options || [{ text: '', is_correct: false }]
  }

  validate() {
    if (!this.text?.trim()) throw new Error('Question text is required')
    if (this.options.length < 2) throw new Error('At least 2 options required')
    if (!this.options.some(opt => opt.is_correct)) {
      throw new Error('At least one correct option required')
    }
    return true
  }

  toAPIFormat() {
    return {
      text: this.text,
      type: this.type,
      category_id: this.category_id,
      options: this.options.map(opt => ({
        text: opt.text,
        is_correct: opt.is_correct,
      })),
    }
  }
}

class TrueFalseQuestion {
  constructor(data) {
    this.text = data.text
    this.type = 'true_false'
    this.category_id = data.category_id || 1
    // Si data.options existe, respétalo (para edición), si no, inicializa por defecto
    this.options = data.options
      ? [
          {
            text: 'Verdadero',
            is_correct: !!data.options.find(o => o.text === 'Verdadero')?.is_correct,
          },
          { text: 'Falso', is_correct: !!data.options.find(o => o.text === 'Falso')?.is_correct },
        ]
      : [
          { text: 'Verdadero', is_correct: false },
          { text: 'Falso', is_correct: false },
        ]
  }

  validate() {
    if (!this.text?.trim()) throw new Error('Question text is required')
    if (!this.options.some(opt => opt.is_correct)) {
      throw new Error('Must select True or False')
    }
    return true
  }

  toAPIFormat() {
    return {
      text: this.text,
      type: this.type,
      category_id: this.category_id,
      options: this.options.map(opt => ({
        text: opt.text,
        is_correct: opt.is_correct,
      })),
    }
  }
}

export default QuestionFactory
