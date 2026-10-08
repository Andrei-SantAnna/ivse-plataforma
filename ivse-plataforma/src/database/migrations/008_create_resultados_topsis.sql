CREATE TABLE IF NOT EXISTS resultados_topsis (
    id SERIAL PRIMARY KEY,

    analise_id INTEGER,

    municipio_id INTEGER,

    ivse_score NUMERIC(8,2)
        NOT NULL,

    dist_ideal_positiva NUMERIC(10,8),

    dist_ideal_negativa NUMERIC(10,8),

    posicao_ranking INTEGER
        NOT NULL,

    CONSTRAINT resultados_topsis_analise_id_fkey
    FOREIGN KEY (
        analise_id
    )
    REFERENCES analises(id)
    ON DELETE CASCADE,

    CONSTRAINT resultados_topsis_municipio_id_fkey
    FOREIGN KEY (
        municipio_id
    )
    REFERENCES municipios(id)
);