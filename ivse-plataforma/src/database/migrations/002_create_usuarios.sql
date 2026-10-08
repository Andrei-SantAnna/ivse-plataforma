CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    perfil VARCHAR(50)
        DEFAULT 'pesquisador',

    criado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuarios_perfil
    CHECK (
        perfil IN (
            'administrador',
            'pesquisador',
            'gestor'
        )
    )
);