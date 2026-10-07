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
  const { titulo, ano_referencia, criterios, usuario_id, municipios_ids = [] } = req.body;

  if (!titulo || !ano_referencia || !criterios || criterios.length === 0) {
    return res.status(400).json({ erro: 'Os campos titulo, ano_referencia e a lista de criterios são obrigatórios.' });
  }

  const municipiosIdsNormalizados = [
  ...new Set(
    municipios_ids
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0)
  )
];

if (
  municipios_ids.length > 0 &&
  municipiosIdsNormalizados.length < 2
) {
  return res.status(400).json({
    erro: 'Selecione pelo menos dois municípios para executar uma análise comparativa.'
  });
}

  // Extrair arrays isolados para o motor matemático
  const indicadorIds = criterios.map(c => c.indicador_id);
  const pesos = criterios.map(c => Number(c.peso));
  const tipos = criterios.map(c => c.tipo_direcao);

  // Iniciar cliente dedicado para a Transação SQL
  // Apenas para validar conexão antes do fluxo pesado
  await db.query('SELECT 1'); 
  
  try {
    // 1. Buscar dados no PostgreSQL filtrando por ano e indicadores requisitados
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
    AND v.indicador_id = ANY($2::int[])
`;

const parametros = [
  ano_referencia,
  indicadorIds
];


// Se o usuário selecionou municípios específicos,
// filtra somente esses IDs.
if (municipiosIdsNormalizados.length > 0) {

  sqlDados += `
    AND m.id = ANY($3::int[])
  `;

  parametros.push(
    municipiosIdsNormalizados
  );
}


sqlDados += `
  ORDER BY m.nome ASC
`;


const dadosBrutos = await db.query(
  sqlDados,
  parametros
);

    // 2. Pivotar os dados: Agrupar valores por município
    const dadosPorMunicipio = {};
    dadosBrutos.rows.forEach(row => {
      if (!dadosPorMunicipio[row.municipio_id]) {
        dadosPorMunicipio[row.municipio_id] = { id: row.municipio_id, nome: row.municipio_nome, valores: {} };
      }
      dadosPorMunicipio[row.municipio_id].valores[row.indicador_id] = parseFloat(row.valor);
    });

    // 3. Construir a Matriz de Decisão
    const matriz = [];
    const alternativas = [];
    const alternativasIds = [];

    for (const munId in dadosPorMunicipio) {
      const mun = dadosPorMunicipio[munId];
      let temTodosOsIndicadores = true;
      const linha = [];

      for (const crit of criterios) {
        if (mun.valores[crit.indicador_id] === undefined) {
          temTodosOsIndicadores = false; // Descarta municípios com dados ausentes (Tratamento de Inconsistência)
          break;
        }
        linha.push(mun.valores[crit.indicador_id]);
      }

      if (temTodosOsIndicadores) {
        matriz.push(linha);
        alternativas.push(mun.nome);
        alternativasIds.push(mun.id);
      }
    }

    if (matriz.length === 0) {
      return res.status(404).json({ erro: 'Nenhum município possui dados completos para os indicadores selecionados neste ano.' });
    }

    // 4. Executar o Motor Matemático
    const ranking = topsisService.calcular(matriz, pesos, tipos, alternativas);

    // 5. Iniciar Transação de Gravação
    await db.query('BEGIN');

    // Gravar a Análise Pai
    const resAnalise = await db.query(
      `
      INSERT INTO analises (
        titulo,
        ano_referencia,
        usuario_id
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        titulo,
        ano_referencia,
        usuario_id || null
      ]
    );
    const analiseId = resAnalise.rows[0].id;

    // Gravar os Critérios Utilizados
    for (const crit of criterios) {
      await db.query(
        'INSERT INTO criterios_analise (analise_id, indicador_id, peso, tipo_direcao) VALUES ($1, $2, $3, $4)',
        [analiseId, crit.indicador_id, crit.peso, crit.tipo_direcao]
      );
    }

    // Gravar o Ranking Final e Distâncias
    for (let i = 0; i < ranking.length; i++) {
      const r = ranking[i];
      const municipioId = alternativasIds.find(id => dadosPorMunicipio[id].nome === r.municipio);
      
      await db.query(
        'INSERT INTO resultados_topsis (analise_id, municipio_id, ivse_score, dist_ideal_positiva, dist_ideal_negativa, posicao_ranking) VALUES ($1, $2, $3, $4, $5, $6)',
        [analiseId, municipioId, r.ivse_score, r.distancia_positiva, r.distancia_negativa, r.posicao_ranking]
      );
    }

    // Confirmar as gravações
    await db.query('COMMIT');

    res.status(201).json({
      mensagem: 'Análise executada e salva com sucesso!',
      analise_id: analiseId,
      total_analisado: alternativas.length,
      ranking: ranking
    });

  } catch (erro) {
    await db.query('ROLLBACK'); // Desfaz tudo em caso de falha matemática ou de banco
    console.error('Erro na execução da análise:', erro);
    res.status(500).json({ erro: 'Falha interna ao executar a análise. Nenhuma alteração foi salva.' });
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