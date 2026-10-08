CREATE TABLE IF NOT EXISTS analises (
    id SERIAL PRIMARY KEY,

    titulo VARCHAR(255)
        NOT NULL,

    usuario_id INTEGER,

    data_execucao TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(50)
        DEFAULT 'concluida',

    ano_referencia INTEGER,

    CONSTRAINT analises_usuario_id_fkey
    FOREIGN KEY (
        usuario_id
    )
    REFERENCES usuarios(id)
    ON DELETE SET NULL
);