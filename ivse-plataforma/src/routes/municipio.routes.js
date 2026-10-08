const express = require('express');

const router = express.Router();

const municipioController =
  require('../controllers/municipio.controller');


/**
 * @swagger
 * tags:
 *   name: Municípios
 *   description: Cadastro e consulta dos municípios
 */


/**
 * @swagger
 * /api/municipios:
 *   get:
 *     summary: Lista os municípios
 *     description: Retorna os municípios cadastrados. Pode receber um ID de análise para incluir resultados TOPSIS.
 *     tags:
 *       - Municípios
 *     parameters:
 *       - in: query
 *         name: analise_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID opcional da análise TOPSIS
 *         example: 13
 *     responses:
 *       200:
 *         description: Lista de municípios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   codigo_ibge:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   uf:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                     nullable: true
 *                   longitude:
 *                     type: number
 *                     nullable: true
 *                   ivse_score:
 *                     type: number
 *                     nullable: true
 *                   posicao_ranking:
 *                     type: integer
 *                     nullable: true
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/',
  municipioController.listar
);


/**
 * @swagger
 * /api/municipios:
 *   post:
 *     summary: Cadastra um município
 *     description: Cadastra um novo município na plataforma.
 *     tags:
 *       - Municípios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo_ibge
 *               - nome
 *               - uf
 *             properties:
 *               codigo_ibge:
 *                 type: string
 *                 example: "2927408"
 *               nome:
 *                 type: string
 *                 example: Salvador
 *               uf:
 *                 type: string
 *                 example: BA
 *               latitude:
 *                 type: number
 *                 format: double
 *                 example: -12.9714
 *               longitude:
 *                 type: number
 *                 format: double
 *                 example: -38.5014
 *     responses:
 *       201:
 *         description: Município cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Código IBGE já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  municipioController.criar
);


module.exports = router;