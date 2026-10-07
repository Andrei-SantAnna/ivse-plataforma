// src/controllers/indicador.controller.js

const db = require('../config/database');
const csv = require('csv-parser');
const { Readable } = require('stream');


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
exports.importarCSV = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        erro: 'Nenhum arquivo CSV foi enviado.'
      });
    }


    const linhas = [];

    const stream = Readable.from(
      req.file.buffer.toString('utf-8')
    );


    await new Promise((resolve, reject) => {

      stream
        .pipe(csv())
        .on('data', (linha) => {

  const possuiConteudo =
    Object.values(linha).some(
      valor =>
        String(valor ?? '').trim() !== ''
    );

  if (possuiConteudo) {
    linhas.push(linha);
  }

})
        .on('end', resolve)
        .on('error', reject);

    });


    if (linhas.length === 0) {

      return res.status(400).json({
        erro: 'O arquivo CSV está vazio.'
      });

    }


    const colunasObrigatorias = [
      'codigo_ibge',
      'codigo_indicador',
      'valor',
      'ano_referencia'
    ];


    const primeiraLinha = linhas[0];


    const colunasFaltando =
      colunasObrigatorias.filter(
        coluna =>
          !Object.prototype.hasOwnProperty.call(
            primeiraLinha,
            coluna
          )
      );


    if (colunasFaltando.length > 0) {

      return res.status(400).json({

        erro:
          'O CSV não possui todas as colunas obrigatórias.',

        colunas_faltando:
          colunasFaltando,

        formato_esperado:
          'codigo_ibge,codigo_indicador,valor,ano_referencia'

      });

    }


    const resumo = {

      total_linhas:
        linhas.length,

      inseridos: 0,

      atualizados: 0,

      rejeitados: 0,

      erros: []

    };


    for (
      let i = 0;
      i < linhas.length;
      i++
    ) {

      const linha =
        linhas[i];


      const numeroLinha =
        i + 2;


      const codigoIbge =
        String(
          linha.codigo_ibge || ''
        ).trim();


      const codigoIndicador =
        String(
          linha.codigo_indicador || ''
        )
          .trim()
          .toUpperCase();


      const valorTexto =
        String(
          linha.valor || ''
        )
          .trim()
          .replace(',', '.');


      const anoTexto =
        String(
          linha.ano_referencia || ''
        ).trim();


      const valor =
        Number(
          valorTexto
        );


      const ano =
        Number(
          anoTexto
        );


      // ======================================================
      // CAMPOS OBRIGATÓRIOS
      // ======================================================

      if (
        !codigoIbge ||
        !codigoIndicador ||
        valorTexto === '' ||
        anoTexto === ''
      ) {

        resumo.rejeitados++;


        resumo.erros.push({

          linha:
            numeroLinha,

          motivo:
            'Existem campos obrigatórios vazios.'

        });


        continue;

      }


      // ======================================================
      // VALOR
      // ======================================================

      if (
        !Number.isFinite(valor)
      ) {

        resumo.rejeitados++;


        resumo.erros.push({

          linha:
            numeroLinha,

          motivo:
            `Valor inválido: ${linha.valor}`

        });


        continue;

      }


      // ======================================================
      // ANO
      // ======================================================

      if (
        !Number.isInteger(ano) ||
        ano < 2000 ||
        ano > 2100
      ) {

        resumo.rejeitados++;


        resumo.erros.push({

          linha:
            numeroLinha,

          motivo:
            `Ano de referência inválido: ${linha.ano_referencia}`

        });


        continue;

      }


      // ======================================================
      // MUNICÍPIO
      // ======================================================

      const municipioResult =
        await db.query(
          `
          SELECT id
          FROM municipios
          WHERE codigo_ibge = $1
          `,
          [
            codigoIbge
          ]
        );


      if (
        municipioResult.rows.length === 0
      ) {

        resumo.rejeitados++;


        resumo.erros.push({

          linha:
            numeroLinha,

          motivo:
            `Município com código IBGE ${codigoIbge} não encontrado.`

        });


        continue;

      }


      // ======================================================
      // INDICADOR
      // ======================================================

      const indicadorResult =
        await db.query(
          `
          SELECT id
          FROM indicadores
          WHERE UPPER(codigo) = $1
          `,
          [
            codigoIndicador
          ]
        );


      if (
        indicadorResult.rows.length === 0
      ) {

        resumo.rejeitados++;


        resumo.erros.push({

          linha:
            numeroLinha,

          motivo:
            `Indicador ${codigoIndicador} não encontrado.`

        });


        continue;

      }


      const municipioId =
        municipioResult.rows[0].id;


      const indicadorId =
        indicadorResult.rows[0].id;


      // ======================================================
      // VERIFICAR SE JÁ EXISTE
      // ======================================================

      const existenteResult =
        await db.query(
          `
          SELECT id
          FROM valores_indicadores
          WHERE municipio_id = $1
            AND indicador_id = $2
            AND ano_referencia = $3
          `,
          [
            municipioId,
            indicadorId,
            ano
          ]
        );


      // ======================================================
      // UPDATE
      // ======================================================

      if (
        existenteResult.rows.length > 0
      ) {

        await db.query(
          `
          UPDATE valores_indicadores

          SET valor = $1

          WHERE municipio_id = $2
            AND indicador_id = $3
            AND ano_referencia = $4
          `,
          [
            valor,
            municipioId,
            indicadorId,
            ano
          ]
        );


        resumo.atualizados++;

      }


      // ======================================================
      // INSERT
      // ======================================================

      else {

        await db.query(
          `
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
          `,
          [
            municipioId,
            indicadorId,
            valor,
            ano
          ]
        );


        resumo.inseridos++;

      }

    }


    return res.status(200).json({

      mensagem:
        'Importação CSV concluída.',

      resumo

    });


  } catch (erro) {

    console.error(
      'Erro ao importar CSV:',
      erro
    );


    return res.status(500).json({

      erro:
        'Erro interno durante a importação do CSV.',

      detalhe:
        erro.message

    });

  }

};