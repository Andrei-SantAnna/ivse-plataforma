CREATE TABLE IF NOT EXISTS criterios_analise (
    id SERIAL PRIMARY KEY,

    analise_id INTEGER,

    indicador_id INTEGER,

    peso NUMERIC(5,4)
        NOT NULL,

    tipo_direcao VARCHAR(20),

    CONSTRAINT criterios_analise_tipo_direcao_check
    CHECK (
        tipo_direcao IN (
            'beneficio',
            'custo'
        )
    ),

    CONSTRAINT criterios_analise_analise_id_fkey
    FOREIGN KEY (
        analise_id
    )
    REFERENCES analises(id)
    ON DELETE CASCADE,

    CONSTRAINT criterios_analise_indicador_id_fkey
    FOREIGN KEY (
        indicador_id
    )
    REFERENCES indicadores(id)
);