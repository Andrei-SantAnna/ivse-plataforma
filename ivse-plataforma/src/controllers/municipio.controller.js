// src/controllers/municipio.controller.js
const db = require('../config/database');

exports.criar = async (req, res) => {
  const { codigo_ibge, nome, uf } = req.body;

  // Validação básica
  if (!codigo_ibge || !nome || !uf) {
    return res.status(400).json({ erro: 'Os campos codigo_ibge, nome e uf são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO municipios (codigo_ibge, nome, uf) 
      VALUES ($1, $2, $3) 
      RETURNING id, codigo_ibge, nome, uf, criado_em
    `;
    const resultado = await db.query(query, [codigo_ibge, nome, uf]);
    
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao cadastrar município:', erro);
    // Tratamento de erro específico para código IBGE duplicado (violou a restrição UNIQUE)
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um município cadastrado com este Código IBGE.' });
    }
    res.status(500).json({ erro: 'Falha interna ao cadastrar o município.' });
  }
};

exports.listar = async (req, res) => {
  try {
    const query = 'SELECT id, codigo_ibge, nome, uf, coordenadas FROM municipios ORDER BY nome ASC';
    const resultado = await db.query(query);
    
    res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao listar municípios:', erro);
    res.status(500).json({ erro: 'Falha interna ao buscar os municípios.' });
  }
};