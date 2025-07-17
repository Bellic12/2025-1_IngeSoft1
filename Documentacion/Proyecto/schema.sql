-- Category table
CREATE TABLE Category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Question table
CREATE TABLE Question (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    type TEXT CHECK(type IN ('multiple_choice', 'true_false')),
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT CHECK(source IN ('manual', 'generated')),
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL
);

-- Option table (answer choices for multiple choice questions)
CREATE TABLE Option (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE
);

-- Exam table
CREATE TABLE Exam (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Junction table between exams and questions
CREATE TABLE ExamQuestion (
    exam_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE
);

-- Result table (exam attempts)
CREATE TABLE Result (
    result_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    score INTEGER,
    correct_answers INTEGER,
    incorrect_answers INTEGER,
    time_used INTEGER,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE
);

-- User answers in a result
CREATE TABLE UserAnswer (
    result_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    option_id INTEGER,
    is_correct BOOLEAN,
    PRIMARY KEY (result_id, question_id),
    FOREIGN KEY (result_id) REFERENCES Result(result_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Option(option_id)
);
