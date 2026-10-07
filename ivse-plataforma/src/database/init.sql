-- Arquivo de inicialização do banco de dados PostgreSQL com PostGIS
-- Criação da extensão espacial para suporte a coordenadas geográficas
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'pesquisador',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    codigo_ibge VARCHAR(7) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    coordenadas GEOMETRY(Point, 4326),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS indicadores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    dimensao VARCHAR(100),
    unidade_medida VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS valores_indicadores (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE,
    indicador_id INTEGER REFERENCES indicadores(id) ON DELETE CASCADE,
    valor NUMERIC(15, 6) NOT NULL,
    ano_referencia INTEGER NOT NULL,
    -- Garante que não há indicadores duplicados para a mesma cidade e ano
    UNIQUE(municipio_id, indicador_id, ano_referencia) 
);

CREATE TABLE IF NOT EXISTS analises (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    ano_referencia INTEGER NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    data_execucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'concluida'
);

CREATE TABLE IF NOT EXISTS criterios_analise (
    id SERIAL PRIMARY KEY,
    analise_id INTEGER REFERENCES analises(id) ON DELETE CASCADE,
    indicador_id INTEGER REFERENCES indicadores(id),
    peso NUMERIC(5, 4) NOT NULL,
    tipo_direcao VARCHAR(20) CHECK (tipo_direcao IN ('beneficio', 'custo'))
);

CREATE TABLE IF NOT EXISTS resultados_topsis (
    id SERIAL PRIMARY KEY,
    analise_id INTEGER REFERENCES analises(id) ON DELETE CASCADE,
    municipio_id INTEGER REFERENCES municipios(id),
    ivse_score NUMERIC(10, 8) NOT NULL,
    dist_ideal_positiva NUMERIC(10, 8),
    dist_ideal_negativa NUMERIC(10, 8),
    posicao_ranking INTEGER NOT NULL
);