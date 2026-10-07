// src/controllers/topsis.controller.js
const topsisService = require('../services/topsis.service');
const db = require('../config/database');

/**
 * Rota de simulação (Testa o algoritmo diretamente recebendo os dados do Frontend)
 */
exports.simular = (req, res) => {
  const { matriz, pesos, tipos, alternativas } = req.body;
  try {
    const ranking = topsisService.calcular(matriz, pesos, tipos, alternativas);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ erro: 'Erro na simulação.' });
  }
}; // <-- ESTA É A CHAVE QUE FALTAVA PARA SEPARAR AS FUNÇÕES!

/**
 * Rota de execução principal (Com acesso ao Banco de Dados)
 */
exports.executarAnalise = async (req, res) => {
  const {
    titulo,
    ano_referencia,
    criterios,
    usuario_id,
    municipios_ids = []
  } = req.body;

  try {

    // ============================================================
    // 1. VALIDAÇÕES BÁSICAS
    // ============================================================

    if (
      !titulo ||
      typeof titulo !== 'string' ||
      !titulo.trim()
    ) {
      return res.status(400).json({
        erro: 'O título da análise é obrigatório.'
      });
    }


    const ano = Number(ano_referencia);

    if (
      !Number.isInteger(ano) ||
      ano < 2000 ||
      ano > 2100
    ) {
      return res.status(400).json({
        erro: 'Ano de referência inválido.'
      });
    }


    if (
      !Array.isArray(criterios) ||
      criterios.length < 2
    ) {
      return res.status(400).json({
        erro:
          'Selecione pelo menos dois indicadores para executar o TOPSIS.'
      });
    }


    if (!Array.isArray(municipios_ids)) {
      return res.status(400).json({
        erro:
          'A lista de municípios deve ser um array.'
      });
    }


    // ============================================================
    // 2. NORMALIZAR MUNICÍPIOS
    // ============================================================

    const municipiosIdsNormalizados = [
      ...new Set(
        municipios_ids
          .map(id => Number(id))
          .filter(
            id =>
              Number.isInteger(id) &&
              id > 0
          )
      )
    ];


    if (
      municipios_ids.length > 0 &&
      municipiosIdsNormalizados.length < 2
    ) {
      return res.status(400).json({
        erro:
          'Selecione pelo menos dois municípios para executar uma análise comparativa.'
      });
    }


    // ============================================================
    // 3. VALIDAR CRITÉRIOS
    // ============================================================

    const indicadorIds = [];

    const pesos = [];

    const tipos = [];


    for (
      let i = 0;
      i < criterios.length;
      i++
    ) {

      const criterio =
        criterios[i];


      const indicadorId =
        Number(
          criterio.indicador_id
        );


      const peso =
        Number(
          criterio.peso
        );


      const tipo =
        criterio.tipo_direcao;


      if (
        !Number.isInteger(indicadorId) ||
        indicadorId <= 0
      ) {

        return res.status(400).json({
          erro:
            `Indicador inválido no critério ${i + 1}.`
        });

      }


      if (
        !Number.isFinite(peso) ||
        peso <= 0
      ) {

        return res.status(400).json({
          erro:
            `O peso do critério ${i + 1} deve ser maior que zero.`
        });

      }


      if (
        ![
          'beneficio',
          'custo'
        ].includes(tipo)
      ) {

        return res.status(400).json({
          erro:
            `O critério ${i + 1} possui direção inválida. Use beneficio ou custo.`
        });

      }


      indicadorIds.push(
        indicadorId
      );

      pesos.push(
        peso
      );

      tipos.push(
        tipo
      );

    }


    // ============================================================
    // 4. IMPEDIR INDICADORES DUPLICADOS
    // ============================================================

    const indicadoresUnicos =
      new Set(
        indicadorIds
      );


    if (
      indicadoresUnicos.size !==
      indicadorIds.length
    ) {

      return res.status(400).json({
        erro:
          'Não é permitido utilizar o mesmo indicador mais de uma vez na análise.'
      });

    }


    // ============================================================
    // 5. VALIDAR SE OS INDICADORES EXISTEM
    // ============================================================

    const indicadoresBanco =
      await db.query(
        `
        SELECT
          id,
          codigo,
          nome
        FROM indicadores
        WHERE id = ANY($1::int[])
        `,
        [
          indicadorIds
        ]
      );


    if (
      indicadoresBanco.rows.length !==
      indicadorIds.length
    ) {

      const encontrados =
        indicadoresBanco.rows.map(
          indicador =>
            Number(indicador.id)
        );


      const inexistentes =
        indicadorIds.filter(
          id =>
            !encontrados.includes(id)
        );


      return res.status(400).json({
        erro:
          'Um ou mais indicadores selecionados não existem.',
        indicadores_inexistentes:
          inexistentes
      });

    }


    // ============================================================
    // 6. VALIDAR MUNICÍPIOS SE HOUVER SELEÇÃO ESPECÍFICA
    // ============================================================

    if (
      municipiosIdsNormalizados.length > 0
    ) {

      const municipiosBanco =
        await db.query(
          `
          SELECT id
          FROM municipios
          WHERE id = ANY($1::int[])
          `,
          [
            municipiosIdsNormalizados
          ]
        );


      if (
        municipiosBanco.rows.length !==
        municipiosIdsNormalizados.length
      ) {

        const encontrados =
          municipiosBanco.rows.map(
            municipio =>
              Number(municipio.id)
          );


        const inexistentes =
          municipiosIdsNormalizados.filter(
            id =>
              !encontrados.includes(id)
          );


        return res.status(400).json({
          erro:
            'Um ou mais municípios selecionados não existem.',
          municipios_inexistentes:
            inexistentes
        });

      }

    }


    // ============================================================
    // 7. BUSCAR DADOS
    // ============================================================

    let sqlDados = `
      SELECT
        m.id AS municipio_id,
        m.nome AS municipio_nome,
        v.indicador_id,
        v.valor

      FROM valores_indicadores v

      JOIN municipios m
        ON v.municipio_id = m.id

      WHERE
        v.ano_referencia = $1

        AND v.indicador_id =
          ANY($2::int[])
    `;


    const parametros = [
      ano,
      indicadorIds
    ];


    if (
      municipiosIdsNormalizados.length > 0
    ) {

      sqlDados += `
        AND m.id =
          ANY($3::int[])
      `;


      parametros.push(
        municipiosIdsNormalizados
      );

    }


    sqlDados += `
      ORDER BY
        m.nome ASC
    `;


    const dadosBrutos =
      await db.query(
        sqlDados,
        parametros
      );


    // ============================================================
    // 8. VALIDAR SE EXISTEM DADOS
    // ============================================================

    if (
      dadosBrutos.rows.length === 0
    ) {

      return res.status(400).json({
        erro:
          'Não existem dados para os indicadores e ano selecionados.'
      });

    }


    // ============================================================
    // 9. AGRUPAR DADOS POR MUNICÍPIO
    // ============================================================

    const dadosPorMunicipio = {};


    dadosBrutos.rows.forEach(
      row => {

        if (
          !dadosPorMunicipio[
            row.municipio_id
          ]
        ) {

          dadosPorMunicipio[
            row.municipio_id
          ] = {

            id:
              row.municipio_id,

            nome:
              row.municipio_nome,

            valores: {}

          };

        }


        const valor =
          Number(
            row.valor
          );


        dadosPorMunicipio[
          row.municipio_id
        ].valores[
          row.indicador_id
        ] = valor;

      }
    );


    // ============================================================
    // 10. CONSTRUIR MATRIZ
    // ============================================================

    const matriz = [];

    const alternativas = [];

    const alternativasIds = [];

    const municipiosDescartados = [];


    for (
      const munId in dadosPorMunicipio
    ) {

      const municipio =
        dadosPorMunicipio[munId];


      const linha = [];

      const indicadoresAusentes = [];

      let linhaValida = true;


      for (
        const criterio of criterios
      ) {

        const indicadorId =
          Number(
            criterio.indicador_id
          );


        const valor =
          municipio.valores[
            indicadorId
          ];


        if (
          valor === undefined ||
          valor === null ||
          !Number.isFinite(valor)
        ) {

          linhaValida = false;

          indicadoresAusentes.push(
            indicadorId
          );

        } else {

          linha.push(
            valor
          );

        }

      }


      if (
        linhaValida
      ) {

        matriz.push(
          linha
        );

        alternativas.push(
          municipio.nome
        );

        alternativasIds.push(
          municipio.id
        );

      } else {

        municipiosDescartados.push({

          municipio_id:
            municipio.id,

          municipio:
            municipio.nome,

          indicadores_ausentes:
            indicadoresAusentes

        });

      }

    }


    // ============================================================
    // 11. MÍNIMO DE ALTERNATIVAS
    // ============================================================

    if (
      matriz.length < 2
    ) {

      return res.status(400).json({

        erro:
          'São necessários pelo menos dois municípios com dados completos para executar o TOPSIS.',

        municipios_validos:
          matriz.length,

        municipios_descartados:
          municipiosDescartados

      });

    }


    // ============================================================
    // 12. VALIDAR TAMANHO DA MATRIZ
    // ============================================================

    const numeroCriterios =
      criterios.length;


    const matrizInvalida =
      matriz.some(
        linha =>
          !Array.isArray(linha) ||
          linha.length !==
            numeroCriterios
      );


    if (
      matrizInvalida
    ) {

      return res.status(400).json({
        erro:
          'A matriz de decisão está inconsistente.'
      });

    }


    // ============================================================
    // 13. VALIDAR VARIAÇÃO DOS CRITÉRIOS
    // ============================================================

    const criteriosSemVariacao = [];


    for (
      let coluna = 0;
      coluna < numeroCriterios;
      coluna++
    ) {

      const valoresColuna =
        matriz.map(
          linha =>
            Number(
              linha[coluna]
            )
        );


      const valoresUnicos =
        new Set(
          valoresColuna
        );


      if (
        valoresUnicos.size <= 1
      ) {

        criteriosSemVariacao.push(
          indicadorIds[coluna]
        );

      }

    }


    if (
      criteriosSemVariacao.length > 0
    ) {

      return res.status(400).json({

        erro:
          'Um ou mais critérios não possuem variação entre os municípios analisados.',

        indicadores_sem_variacao:
          criteriosSemVariacao

      });

    }


    // ============================================================
    // 14. VALIDAR NORMALIZAÇÃO
    // ============================================================

    for (
      let coluna = 0;
      coluna < numeroCriterios;
      coluna++
    ) {

      const somaQuadrados =
        matriz.reduce(
          (soma, linha) => {

            const valor =
              Number(
                linha[coluna]
              );


            return (
              soma +
              valor * valor
            );

          },
          0
        );


      if (
        !Number.isFinite(
          somaQuadrados
        ) ||
        somaQuadrados === 0
      ) {

        return res.status(400).json({

          erro:
            'Não foi possível normalizar um dos critérios.',

          indicador_id:
            indicadorIds[coluna]

        });

      }

    }


    // ============================================================
    // 15. EXECUTAR TOPSIS
    // ============================================================

    const ranking =
      topsisService.calcular(
        matriz,
        pesos,
        tipos,
        alternativas
      );


    if (
      !Array.isArray(ranking) ||
      ranking.length !==
        alternativas.length
    ) {

      throw new Error(
        'O motor TOPSIS retornou um resultado inconsistente.'
      );

    }


    // ============================================================
    // 16. VALIDAR RESULTADOS
    // ============================================================

    for (
      const resultado of ranking
    ) {

      const score =
        Number(
          resultado.ivse_score
        );


      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 1
      ) {

        throw new Error(
          'O motor TOPSIS gerou um IVSE inválido.'
        );

      }

    }


    // ============================================================
    // 17. SALVAR ANÁLISE
    // ============================================================

    await db.query(
      'BEGIN'
    );


    const resAnalise =
      await db.query(
        `
        INSERT INTO analises (
          titulo,
          ano_referencia,
          usuario_id
        )

        VALUES (
          $1,
          $2,
          $3
        )

        RETURNING id
        `,
        [
          titulo.trim(),
          ano,
          usuario_id || null
        ]
      );


    const analiseId =
      resAnalise.rows[0].id;


    // ============================================================
    // 18. SALVAR CRITÉRIOS
    // ============================================================

    for (
      const criterio of criterios
    ) {

      await db.query(
        `
        INSERT INTO criterios_analise (
          analise_id,
          indicador_id,
          peso,
          tipo_direcao
        )

        VALUES (
          $1,
          $2,
          $3,
          $4
        )
        `,
        [
          analiseId,
          Number(
            criterio.indicador_id
          ),
          Number(
            criterio.peso
          ),
          criterio.tipo_direcao
        ]
      );

    }


    // ============================================================
    // 19. SALVAR RESULTADOS
    // ============================================================

    for (
      let i = 0;
      i < ranking.length;
      i++
    ) {

      const resultado =
        ranking[i];


      const municipioId =
        alternativasIds[
          alternativas.indexOf(
            resultado.municipio
          )
        ];


      await db.query(
        `
        INSERT INTO resultados_topsis (
          analise_id,
          municipio_id,
          ivse_score,
          dist_ideal_positiva,
          dist_ideal_negativa,
          posicao_ranking
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        `,
        [
          analiseId,
          municipioId,
          resultado.ivse_score,
          resultado.distancia_positiva,
          resultado.distancia_negativa,
          resultado.posicao_ranking
        ]
      );

    }


    await db.query(
      'COMMIT'
    );


    // ============================================================
    // 20. RESPOSTA
    // ============================================================

    return res.status(201).json({

      mensagem:
        'Análise executada e salva com sucesso!',

      analise_id:
        analiseId,

      ano_referencia:
        ano,

      total_analisado:
        alternativas.length,

      total_descartado:
        municipiosDescartados.length,

      municipios_descartados:
        municipiosDescartados,

      ranking

    });


  } catch (erro) {

    try {
      await db.query(
        'ROLLBACK'
      );
    } catch (_) {
      // Ignora caso nenhuma transação tenha sido iniciada.
    }


    console.error(
      'Erro na execução da análise:',
      erro
    );


    return res.status(500).json({

      erro:
        'Falha interna ao executar a análise. Nenhuma alteração foi salva.',

      detalhe:
        erro.message

    });

  }

};

/**
 * Lista o histórico de análises TOPSIS executadas.
 */
exports.listarAnalises = async (req, res) => {

  try {

    const query = `
      SELECT
        a.id,
        a.titulo,
        a.ano_referencia,
        a.usuario_id,
        a.data_execucao,
        a.status,

        COUNT(rt.id) AS total_municipios

      FROM analises a

      LEFT JOIN resultados_topsis rt
        ON rt.analise_id = a.id

      GROUP BY
        a.id,
        a.titulo,
        a.ano_referencia,
        a.usuario_id,
        a.data_execucao,
        a.status

      ORDER BY
        a.data_execucao DESC,
        a.id DESC
    `;

    const resultado = await db.query(query);

    const analises = resultado.rows.map(
      analise => ({
        ...analise,

        total_municipios:
          Number(
            analise.total_municipios
          )
      })
    );

    res.status(200).json(analises);

  } catch (erro) {

    console.error(
      'Erro ao listar análises TOPSIS:',
      erro
    );

    res.status(500).json({
      erro:
        'Falha interna ao buscar o histórico de análises.'
    });

  }

};