-- Tabla de categorías
CREATE TABLE Categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas
CREATE TABLE Pregunta (
    id_pregunta INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('seleccion_multiple', 'verdadero_falso')),
    id_categoria INTEGER,
    fecha_creacion DATETIME,
    fecha_modificacion DATETIME,
    origen TEXT CHECK(origen IN ('manual', 'generado')),
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE SET NULL
);

-- Tabla de opciones (respuestas para preguntas de selección múltiple)
CREATE TABLE Opcion (
    id_opcion INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    es_correcta BOOLEAN NOT NULL,
    id_pregunta INTEGER NOT NULL,
    FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE
);

-- Tabla de exámenes
CREATE TABLE Examen (
    id_examen INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla puente entre preguntas y exámenes
CREATE TABLE ExamenPregunta (
    id_examen INTEGER NOT NULL,
    id_pregunta INTEGER NOT NULL,
    PRIMARY KEY (id_examen, id_pregunta),
    FOREIGN KEY (id_examen) REFERENCES Examen(id_examen) ON DELETE CASCADE,
    FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE
);

-- Tabla de resultados de exámenes presentados
CREATE TABLE Resultado (
    id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_examen INTEGER NOT NULL,
    puntaje INTEGER,
    aciertos INTEGER,
    desaciertos INTEGER,
    tiempo_utilizado INTEGER,
    fecha_presentacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_examen) REFERENCES Examen(id_examen) ON DELETE CASCADE
);

-- Respuestas del usuario en un resultado
CREATE TABLE RespuestaUsuario (
    id_resultado INTEGER NOT NULL,
    id_pregunta INTEGER NOT NULL,
    id_opcion INTEGER,
    es_correcta BOOLEAN,
    PRIMARY KEY (id_resultado, id_pregunta),
    FOREIGN KEY (id_resultado) REFERENCES Resultado(id_resultado) ON DELETE CASCADE,
    FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE,
    FOREIGN KEY (id_opcion) REFERENCES Opcion(id_opcion)
);