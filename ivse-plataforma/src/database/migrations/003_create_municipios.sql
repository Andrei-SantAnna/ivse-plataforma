CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,

    codigo_ibge VARCHAR(7)
        NOT NULL
        UNIQUE,

    nome VARCHAR(100)
        NOT NULL,

    uf CHAR(2)
        NOT NULL,

    coordenadas geometry(
        Point,
        4326
    ),

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);