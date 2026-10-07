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

    /*
     * Busca:
     *
     * - dados básicos do município
     * - latitude
     * - longitude
     * - último resultado TOPSIS disponível
     * - índice IVSE
     * - ranking
     *
     * A subconsulta escolhe a análise mais recente
     * através do maior ID da tabela analises.
     */

    const query = `
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
        ON rt.id = (
          SELECT rt2.id
          FROM resultados_topsis rt2
          INNER JOIN analises a2
            ON a2.id = rt2.analise_id
          WHERE rt2.municipio_id = m.id
          ORDER BY a2.id DESC
          LIMIT 1
        )

      ORDER BY m.nome ASC
    `;

    const resultado = await db.query(query);

    /*
     * Adicionar classificação da vulnerabilidade
     * para facilitar o trabalho do frontend.
     */

    const municipios = resultado.rows.map(municipio => {

      let nivel_vulnerabilidade = null;

      if (municipio.ivse_score !== null) {

        const score = Number(
          municipio.ivse_score
        );

        if (score < 0.20) {
          nivel_vulnerabilidade = 'Muito baixa';

        } else if (score < 0.40) {
          nivel_vulnerabilidade = 'Baixa';

        } else if (score < 0.60) {
          nivel_vulnerabilidade = 'Moderada';

        } else if (score < 0.80) {
          nivel_vulnerabilidade = 'Alta';

        } else {
          nivel_vulnerabilidade = 'Muito alta';
        }
      }

      return {
        ...municipio,

        ivse_score:
          municipio.ivse_score !== null
            ? Number(municipio.ivse_score)
            : null,

        posicao_ranking:
          municipio.posicao_ranking !== null
            ? Number(municipio.posicao_ranking)
            : null,

        latitude:
          municipio.latitude !== null
            ? Number(municipio.latitude)
            : null,

        longitude:
          municipio.longitude !== null
            ? Number(municipio.longitude)
            : null,

        nivel_vulnerabilidade
      };
    });

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