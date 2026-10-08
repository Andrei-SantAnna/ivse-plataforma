const express = require('express');

const router = express.Router();

const topsisController =
  require('../controllers/topsis.controller');


/**
 * @swagger
 * tags:
 *   name: TOPSIS
 *   description: Execução, histórico e relatórios das análises TOPSIS
 */


/**
 * @swagger
 * /api/topsis/analises:
 *   get:
 *     summary: Lista as análises realizadas
 *     description: Retorna o histórico das análises TOPSIS armazenadas.
 *     tags:
 *       - TOPSIS
 *     responses:
 *       200:
 *         description: Lista de análises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   ano_referencia:
 *                     type: integer
 *                   data_execucao:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/analises',
  topsisController.listarAnalises
);


/**
 * @swagger
 * /api/topsis/executar:
 *   post:
 *     summary: Executa uma análise TOPSIS
 *     description: Valida os dados, executa o cálculo TOPSIS, gera o IVSE e salva o ranking.
 *     tags:
 *       - TOPSIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - ano_referencia
 *               - criterios
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Análise IVSE Bahia 2026
 *               ano_referencia:
 *                 type: integer
 *                 example: 2026
 *               municipios_ids:
 *                 type: array
 *                 description: Lista opcional de municípios. Se vazia, utiliza os municípios elegíveis.
 *                 items:
 *                   type: integer
 *                 example:
 *                   - 6
 *                   - 7
 *                   - 8
 *               criterios:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   required:
 *                     - indicador_id
 *                     - peso
 *                     - tipo_direcao
 *                   properties:
 *                     indicador_id:
 *                       type: integer
 *                       example: 1
 *                     peso:
 *                       type: number
 *                       example: 1
 *                     tipo_direcao:
 *                       type: string
 *                       enum:
 *                         - beneficio
 *                         - custo
 *                       example: beneficio
 *     responses:
 *       200:
 *         description: Análise executada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analise_id:
 *                   type: integer
 *                 total_municipios:
 *                   type: integer
 *                 municipios_descartados:
 *                   type: integer
 *                 ranking:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Dados inválidos para execução do TOPSIS
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/executar',
  topsisController.executarAnalise
);


/**
 * @swagger
 * /api/topsis/analises/{id}/relatorio:
 *   get:
 *     summary: Retorna os dados de uma análise para geração de relatório
 *     description: Retorna informações da análise, critérios, estatísticas e ranking.
 *     tags:
 *       - TOPSIS
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da análise
 *         example: 13
 *     responses:
 *       200:
 *         description: Dados do relatório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analise:
 *                   type: object
 *                 criterios:
 *                   type: array
 *                   items:
 *                     type: object
 *                 estatisticas:
 *                   type: object
 *                   properties:
 *                     ivse_medio:
 *                       type: number
 *                     maior_ivse:
 *                       type: number
 *                     menor_ivse:
 *                       type: number
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Análise não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/analises/:id/relatorio',
  topsisController.obterRelatorio
);


module.exports = router;