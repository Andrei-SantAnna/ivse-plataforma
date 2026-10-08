const express = require('express');

const router = express.Router();

const authController =
  require('../controllers/auth.controller');

const {
  autenticar,
  autorizarPerfis
} = require('../middlewares/auth');


/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Login, sessão e gerenciamento de usuários
 */


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login no sistema
 *     description: Autentica o usuário utilizando e-mail e senha e retorna um token JWT.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ivse.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: senha12345
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     perfil:
 *                       type: string
 *                       enum:
 *                         - administrador
 *                         - pesquisador
 *                         - gestor
 *       400:
 *         description: E-mail ou senha não informados
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/login',
  authController.login
);


/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna o usuário autenticado
 *     description: Retorna os dados do usuário associado ao token JWT informado.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 perfil:
 *                   type: string
 *                   enum:
 *                     - administrador
 *                     - pesquisador
 *                     - gestor
 *                 criado_em:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Token ausente, inválido ou expirado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/me',
  autenticar,
  authController.me
);


/**
 * @swagger
 * /api/auth/usuarios:
 *   get:
 *     summary: Lista os usuários cadastrados
 *     description: Retorna todos os usuários cadastrados. Disponível apenas para administradores.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   perfil:
 *                     type: string
 *                     enum:
 *                       - administrador
 *                       - pesquisador
 *                       - gestor
 *                   criado_em:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/usuarios',
  autenticar,
  autorizarPerfis(
    'administrador'
  ),
  authController.listarUsuarios
);


/**
 * @swagger
 * /api/auth/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Cadastra um novo usuário no sistema. Disponível apenas para administradores.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - perfil
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: pesquisador@ivse.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: senha12345
 *               perfil:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - pesquisador
 *                   - gestor
 *                 example: pesquisador
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 perfil:
 *                   type: string
 *                 criado_em:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       409:
 *         description: E-mail já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/usuarios',
  autenticar,
  autorizarPerfis(
    'administrador'
  ),
  authController.criarUsuario
);


module.exports = router;