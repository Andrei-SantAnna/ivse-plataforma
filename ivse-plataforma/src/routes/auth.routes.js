const express =
  require('express');

const router =
  express.Router();

const authController =
  require('../controllers/auth.controller');

const {
  autenticar,
  autorizarPerfis
} =
  require('../middlewares/auth');


// ============================================================
// LOGIN
// ============================================================

router.post(
  '/login',
  authController.login
);


// ============================================================
// USUÁRIO AUTENTICADO
// ============================================================

router.get(
  '/me',
  autenticar,
  authController.me
);


// ============================================================
// CADASTRAR USUÁRIO
// SOMENTE ADMINISTRADOR
// ============================================================

router.post(
  '/usuarios',
  autenticar,
  autorizarPerfis(
    'administrador'
  ),
  authController.criarUsuario
);


// ============================================================
// LISTAR USUÁRIOS
// SOMENTE ADMINISTRADOR
// ============================================================

router.get(
  '/usuarios',
  autenticar,
  autorizarPerfis(
    'administrador'
  ),
  authController.listarUsuarios
);


module.exports =
  router;