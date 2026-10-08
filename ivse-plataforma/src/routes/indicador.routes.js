const express = require('express');

const router = express.Router();

const indicadorController =
  require('../controllers/indicador.controller');

const upload =
  require('../middlewares/upload');


/**
 * @swagger
 * tags:
 *   name: Indicadores
 *   description: Cadastro de indicadores e valores utilizados nas análises
 */


/**
 * @swagger
 * /api/indicadores:
 *   get:
 *     summary: Lista os indicadores
 *     description: Retorna todos os indicadores cadastrados.
 *     tags:
 *       - Indicadores
 *     responses:
 *       200:
 *         description: Lista de indicadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   codigo:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   dimensao:
 *                     type: string
 *                     nullable: true
 *                   unidade_medida:
 *                     type: string
 *                     nullable: true
 *                   fonte:
 *                     type: string
 *                     nullable: true
 *                   formula:
 *                     type: string
 *                     nullable: true
 *                   descricao:
 *                     type: string
 *                     nullable: true
 *                   tipo_padrao:
 *                     type: string
 *                     nullable: true
 *                     enum:
 *                       - beneficio
 *                       - custo
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/',
  indicadorController.listar
);


/**
 * @swagger
 * /api/indicadores:
 *   post:
 *     summary: Cadastra um novo indicador
 *     description: Cadastra um indicador que poderá ser utilizado em análises TOPSIS.
 *     tags:
 *       - Indicadores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nome
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: I01
 *               nome:
 *                 type: string
 *                 example: Renda domiciliar
 *               dimensao:
 *                 type: string
 *                 example: Vulnerabilidade socioeconômica
 *               unidade_medida:
 *                 type: string
 *                 example: Reais
 *               fonte:
 *                 type: string
 *                 example: IBGE
 *               formula:
 *                 type: string
 *                 example: Valor médio por domicílio
 *               descricao:
 *                 type: string
 *                 example: Indicador de renda média domiciliar
 *               tipo_padrao:
 *                 type: string
 *                 enum:
 *                   - beneficio
 *                   - custo
 *                 example: custo
 *     responses:
 *       201:
 *         description: Indicador cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Código de indicador já existente
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  indicadorController.criar
);


/**
 * @swagger
 * /api/indicadores/valores:
 *   post:
 *     summary: Registra um valor de indicador
 *     description: Associa um valor de indicador a um município e ano de referência.
 *     tags:
 *       - Indicadores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - municipio_id
 *               - indicador_id
 *               - valor
 *               - ano_referencia
 *             properties:
 *               municipio_id:
 *                 type: integer
 *                 example: 6
 *               indicador_id:
 *                 type: integer
 *                 example: 1
 *               valor:
 *                 type: number
 *                 example: 32.5
 *               ano_referencia:
 *                 type: integer
 *                 example: 2026
 *     responses:
 *       201:
 *         description: Valor registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Município ou indicador não encontrado
 *       409:
 *         description: Valor já cadastrado para município, indicador e ano
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/valores',
  indicadorController.adicionarValor
);


/**
 * @swagger
 * /api/indicadores/importar-csv:
 *   post:
 *     summary: Importa valores de indicadores via CSV
 *     description: Importa em lote valores associados aos municípios e indicadores.
 *     tags:
 *       - Indicadores
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - arquivo
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_linhas:
 *                   type: integer
 *                 inseridos:
 *                   type: integer
 *                 atualizados:
 *                   type: integer
 *                 rejeitados:
 *                   type: integer
 *                 erros:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Arquivo ou conteúdo inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/importar-csv',
  upload.single('arquivo'),
  indicadorController.importarCSV
);


module.exports = router;