CREATE TABLE IF NOT EXISTS indicadores (
    id SERIAL PRIMARY KEY,

    codigo VARCHAR(10)
        NOT NULL
        UNIQUE,

    nome VARCHAR(255)
        NOT NULL,

    dimensao VARCHAR(100),

    unidade_medida VARCHAR(50),

    fonte VARCHAR(255),

    formula TEXT,

    descricao TEXT,

    tipo_padrao VARCHAR(20),

    CONSTRAINT chk_indicadores_tipo_padrao
    CHECK (
        tipo_padrao IN (
            'beneficio',
            'custo'
        )
    )
);