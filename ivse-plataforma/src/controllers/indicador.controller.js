// src/controllers/indicador.controller.js
const db = require('../config/database');

// --- Gestão da Tabela 'indicadores' ---

exports.criarIndicador = async (req, res) => {
  const { codigo, nome, dimensao, unidade_medida } = req.body;

  if (!codigo || !nome) {
    return res.status(400).json({ erro: 'Os campos codigo e nome são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO indicadores (codigo, nome, dimensao, unidade_medida) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const resultado = await db.query(query, [codigo, nome, dimensao, unidade_medida]);
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao cadastrar indicador:', erro);
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um indicador com este código.' });
    }
    res.status(500).json({ erro: 'Falha ao cadastrar o indicador.' });
  }
};

exports.listarIndicadores = async (req, res) => {
  try {
    const query = 'SELECT * FROM indicadores ORDER BY dimensao ASC, nome ASC';
    const resultado = await db.query(query);
    res.status(200).json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Falha ao listar os indicadores.' });
  }
};

// --- Gestão da Tabela 'valores_indicadores' ---

exports.adicionarValor = async (req, res) => {
  const { municipio_id, indicador_id, valor, ano_referencia } = req.body;

  if (!municipio_id || !indicador_id || valor === undefined || !ano_referencia) {
    return res.status(400).json({ erro: 'municipio_id, indicador_id, valor e ano_referencia são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO valores_indicadores (municipio_id, indicador_id, valor, ano_referencia) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const resultado = await db.query(query, [municipio_id, indicador_id, valor, ano_referencia]);
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao inserir valor do indicador:', erro);
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Este indicador já possui um valor cadastrado para este município neste ano.' });
    }
    res.status(500).json({ erro: 'Falha ao registar o valor do indicador.' });
  }
};