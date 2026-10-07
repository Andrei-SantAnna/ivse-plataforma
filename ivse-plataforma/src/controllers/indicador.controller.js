// src/controllers/indicador.controller.js

const db = require('../config/database');


// ============================================================
// CADASTRAR INDICADOR
// ============================================================

exports.criar = async (req, res) => {

  const {
    codigo,
    nome,
    dimensao,
    unidade_medida,
    fonte,
    formula,
    descricao,
    tipo_padrao
  } = req.body;


  // ----------------------------------------------------------
  // VALIDAÇÕES
  // ----------------------------------------------------------

  if (!codigo || !nome) {
    return res.status(400).json({
      erro: 'Os campos código e nome são obrigatórios.'
    });
  }


  if (
    tipo_padrao &&
    !['beneficio', 'custo'].includes(tipo_padrao)
  ) {
    return res.status(400).json({
      erro:
        'O tipo padrão deve ser "beneficio" ou "custo".'
    });
  }


  try {

    const query = `
      INSERT INTO indicadores (
        codigo,
        nome,
        dimensao,
        unidade_medida,
        fonte,
        formula,
        descricao,
        tipo_padrao
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
    `;


    const resultado = await db.query(
      query,
      [
        codigo.trim().toUpperCase(),
        nome.trim(),
        dimensao?.trim() || null,
        unidade_medida?.trim() || null,
        fonte?.trim() || null,
        formula?.trim() || null,
        descricao?.trim() || null,
        tipo_padrao || null
      ]
    );


    return res.status(201).json(
      resultado.rows[0]
    );


  } catch (erro) {

    console.error(
      'Erro ao cadastrar indicador:',
      erro
    );


    // Código duplicado
    if (erro.code === '23505') {

      return res.status(409).json({
        erro:
          'Já existe um indicador cadastrado com este código.'
      });

    }


    // Violação de CHECK
    if (erro.code === '23514') {

      return res.status(400).json({
        erro:
          'O tipo padrão informado é inválido.'
      });

    }


    return res.status(500).json({
      erro:
        'Falha interna ao cadastrar o indicador.'
    });

  }

};


// ============================================================
// LISTAR INDICADORES
// ============================================================

exports.listar = async (req, res) => {

  try {

    const query = `
      SELECT
        id,
        codigo,
        nome,
        dimensao,
        unidade_medida,
        fonte,
        formula,
        descricao,
        tipo_padrao
      FROM indicadores
      ORDER BY codigo ASC
    `;


    const resultado = await db.query(query);


    return res.status(200).json(
      resultado.rows
    );


  } catch (erro) {

    console.error(
      'Erro ao listar indicadores:',
      erro
    );


    return res.status(500).json({
      erro:
        'Falha interna ao buscar os indicadores.'
    });

  }

};


// ============================================================
// ADICIONAR VALOR DE INDICADOR A UM MUNICÍPIO
// ============================================================

exports.adicionarValor = async (req, res) => {

  const {
    municipio_id,
    indicador_id,
    valor,
    ano_referencia
  } = req.body;


  // ----------------------------------------------------------
  // CAMPOS OBRIGATÓRIOS
  // ----------------------------------------------------------

  if (
    municipio_id === undefined ||
    indicador_id === undefined ||
    valor === undefined ||
    ano_referencia === undefined
  ) {

    return res.status(400).json({
      erro:
        'municipio_id, indicador_id, valor e ano_referencia são obrigatórios.'
    });

  }


  // ----------------------------------------------------------
  // CONVERSÃO
  // ----------------------------------------------------------

  const municipioId =
    Number(municipio_id);

  const indicadorId =
    Number(indicador_id);

  const valorNumerico =
    Number(valor);

  const ano =
    Number(ano_referencia);


  // ----------------------------------------------------------
  // VALIDAR MUNICÍPIO
  // ----------------------------------------------------------

  if (
    !Number.isInteger(municipioId) ||
    municipioId <= 0
  ) {

    return res.status(400).json({
      erro: 'municipio_id inválido.'
    });

  }


  // ----------------------------------------------------------
  // VALIDAR INDICADOR
  // ----------------------------------------------------------

  if (
    !Number.isInteger(indicadorId) ||
    indicadorId <= 0
  ) {

    return res.status(400).json({
      erro: 'indicador_id inválido.'
    });

  }


  // ----------------------------------------------------------
  // VALIDAR VALOR
  // ----------------------------------------------------------

  if (
    !Number.isFinite(valorNumerico)
  ) {

    return res.status(400).json({
      erro:
        'O valor do indicador deve ser numérico.'
    });

  }


  // ----------------------------------------------------------
  // VALIDAR ANO
  // ----------------------------------------------------------

  if (
    !Number.isInteger(ano) ||
    ano < 2000 ||
    ano > 2100
  ) {

    return res.status(400).json({
      erro:
        'Ano de referência inválido.'
    });

  }


  try {

    // --------------------------------------------------------
    // VERIFICAR SE MUNICÍPIO EXISTE
    // --------------------------------------------------------

    const municipioExiste =
      await db.query(
        `
        SELECT id
        FROM municipios
        WHERE id = $1
        `,
        [municipioId]
      );


    if (
      municipioExiste.rows.length === 0
    ) {

      return res.status(404).json({
        erro:
          'Município não encontrado.'
      });

    }


    // --------------------------------------------------------
    // VERIFICAR SE INDICADOR EXISTE
    // --------------------------------------------------------

    const indicadorExiste =
      await db.query(
        `
        SELECT id
        FROM indicadores
        WHERE id = $1
        `,
        [indicadorId]
      );


    if (
      indicadorExiste.rows.length === 0
    ) {

      return res.status(404).json({
        erro:
          'Indicador não encontrado.'
      });

    }


    // --------------------------------------------------------
    // INSERIR VALOR
    // --------------------------------------------------------

    const query = `
      INSERT INTO valores_indicadores (
        municipio_id,
        indicador_id,
        valor,
        ano_referencia
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *
    `;


    const resultado =
      await db.query(
        query,
        [
          municipioId,
          indicadorId,
          valorNumerico,
          ano
        ]
      );


    return res.status(201).json(
      resultado.rows[0]
    );


  } catch (erro) {

    console.error(
      'Erro ao registrar valor do indicador:',
      erro
    );


    // --------------------------------------------------------
    // DUPLICIDADE
    // --------------------------------------------------------

    if (erro.code === '23505') {

      return res.status(409).json({
        erro:
          'Este indicador já possui um valor cadastrado para este município neste ano.'
      });

    }


    // --------------------------------------------------------
    // CHAVE ESTRANGEIRA
    // --------------------------------------------------------

    if (erro.code === '23503') {

      return res.status(400).json({
        erro:
          'Município ou indicador informado não existe.'
      });

    }


    return res.status(500).json({
      erro:
        'Falha interna ao registrar o valor do indicador.'
    });

  }

};