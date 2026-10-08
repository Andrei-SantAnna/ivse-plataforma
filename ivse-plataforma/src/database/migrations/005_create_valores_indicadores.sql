CREATE TABLE IF NOT EXISTS valores_indicadores (
    id SERIAL PRIMARY KEY,

    municipio_id INTEGER,

    indicador_id INTEGER,

    valor NUMERIC(15,6)
        NOT NULL,

    ano_referencia INTEGER
        NOT NULL,

    CONSTRAINT valores_indicadores_municipio_id_fkey
    FOREIGN KEY (
        municipio_id
    )
    REFERENCES municipios(id)
    ON DELETE CASCADE,

    CONSTRAINT valores_indicadores_indicador_id_fkey
    FOREIGN KEY (
        indicador_id
    )
    REFERENCES indicadores(id)
    ON DELETE CASCADE,

    CONSTRAINT valores_indicadores_municipio_id_indicador_id_ano_referenci_key
    UNIQUE (
        municipio_id,
        indicador_id,
        ano_referencia
    )
);