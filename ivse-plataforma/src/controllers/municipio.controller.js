// src/controllers/municipio.controller.js

const db = require('../config/database');


// ============================================================
// CADASTRAR MUNICÍPIO
// ============================================================

exports.criar = async (req, res) => {
  const { codigo_ibge, nome, uf } = req.body;

  if (!codigo_ibge || !nome || !uf) {
    return res.status(400).json({
      erro: 'Os campos codigo_ibge, nome e uf são obrigatórios.'
    });
  }

  try {
    const query = `
      INSERT INTO municipios
        (codigo_ibge, nome, uf)
      VALUES
        ($1, $2, $3)
      RETURNING
        id,
        codigo_ibge,
        nome,
        uf,
        criado_em
    `;

    const resultado = await db.query(
      query,
      [codigo_ibge, nome, uf]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (erro) {

    console.error(
      'Erro ao cadastrar município:',
      erro
    );

    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'Já existe um município cadastrado com este Código IBGE.'
      });
    }

    res.status(500).json({
      erro: 'Falha interna ao cadastrar o município.'
    });
  }
};


// ============================================================
// LISTAR MUNICÍPIOS
// ============================================================

exports.listar = async (req, res) => {
  try {
    // ============================================================
    // 1. RECEBER ANALISE_ID PELA URL
    // ============================================================
    let analiseId = req.query.analise_id
      ? Number(req.query.analise_id)
      : null;

    if (
      req.query.analise_id &&
      (!Number.isInteger(analiseId) || analiseId <= 0)
    ) {
      return res.status(400).json({
        erro: 'O parâmetro analise_id deve ser um número inteiro válido.'
      });
    }


    // ============================================================
    // 2. SE NÃO INFORMAR ANALISE_ID, USAR A ANÁLISE MAIS RECENTE
    // ============================================================

    if (!analiseId) {
      const ultimaAnalise = await db.query(`
        SELECT
          id
        FROM analises
        WHERE status = 'concluida'
        ORDER BY
          data_execucao DESC,
          id DESC
        LIMIT 1
      `);

      if (ultimaAnalise.rows.length > 0) {
        analiseId = ultimaAnalise.rows[0].id;
      }
    }


    // ============================================================
    // 3. SE FOI INFORMADA UMA ANÁLISE, VALIDAR SE ELA EXISTE
    // ============================================================

    if (analiseId) {
      const analiseExiste = await db.query(
        `
        SELECT id
        FROM analises
        WHERE id = $1
        `,
        [analiseId]
      );

      if (analiseExiste.rows.length === 0) {
        return res.status(404).json({
          erro: 'Análise TOPSIS não encontrada.'
        });
      }
    }


    // ============================================================
    // 4. BUSCAR MUNICÍPIOS
    // ============================================================

    let resultado;

    if (analiseId) {

      // Existe uma análise selecionada.
      // Todos os resultados TOPSIS vêm SOMENTE dela.

      resultado = await db.query(
        `
        SELECT
          m.id,
          m.codigo_ibge,
          m.nome,
          m.uf,

          ST_X(m.coordenadas) AS longitude,
          ST_Y(m.coordenadas) AS latitude,

          rt.ivse_score,
          rt.posicao_ranking,
          rt.dist_ideal_positiva,
          rt.dist_ideal_negativa,
          rt.analise_id

        FROM municipios m

        LEFT JOIN resultados_topsis rt
          ON rt.municipio_id = m.id
          AND rt.analise_id = $1

        ORDER BY
          m.nome ASC
        `,
        [analiseId]
      );

    } else {

      // Ainda não existe nenhuma análise no sistema.
      // Retorna os municípios normalmente, mas sem TOPSIS.

      resultado = await db.query(`
        SELECT
          m.id,
          m.codigo_ibge,
          m.nome,
          m.uf,

          ST_X(m.coordenadas) AS longitude,
          ST_Y(m.coordenadas) AS latitude,

          NULL AS ivse_score,
          NULL AS posicao_ranking,
          NULL AS dist_ideal_positiva,
          NULL AS dist_ideal_negativa,
          NULL AS analise_id

        FROM municipios m

        ORDER BY
          m.nome ASC
      `);
    }


    // ============================================================
    // 5. FORMATAR OS DADOS
    // ============================================================

    const municipios = resultado.rows.map(municipio => {

      let nivelVulnerabilidade = null;

      if (municipio.ivse_score !== null) {

        const score = Number(municipio.ivse_score);

        if (score < 0.20) {
          nivelVulnerabilidade = 'Muito baixa';

        } else if (score < 0.40) {
          nivelVulnerabilidade = 'Baixa';

        } else if (score < 0.60) {
          nivelVulnerabilidade = 'Moderada';

        } else if (score < 0.80) {
          nivelVulnerabilidade = 'Alta';

        } else {
          nivelVulnerabilidade = 'Muito alta';
        }
      }


      return {
        ...municipio,

        latitude:
          municipio.latitude !== null
            ? Number(municipio.latitude)
            : null,

        longitude:
          municipio.longitude !== null
            ? Number(municipio.longitude)
            : null,

        ivse_score:
          municipio.ivse_score !== null
            ? Number(municipio.ivse_score)
            : null,

        posicao_ranking:
          municipio.posicao_ranking !== null
            ? Number(municipio.posicao_ranking)
            : null,

        nivel_vulnerabilidade:
          nivelVulnerabilidade
      };
    });


    // ============================================================
    // 6. RETORNAR
    // ============================================================

    res.status(200).json(municipios);

  } catch (erro) {

    console.error(
      'Erro ao listar municípios:',
      erro
    );

    res.status(500).json({
      erro: 'Falha interna ao buscar os municípios.'
    });
  }
};