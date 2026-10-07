const express = require('express');

const router = express.Router();

const indicadorController =
  require('../controllers/indicador.controller');


// Listar indicadores
router.get(
  '/',
  indicadorController.listar
);


// Cadastrar indicador
router.post(
  '/',
  indicadorController.criar
);


// Registrar valor para município
router.post(
  '/valores',
  indicadorController.adicionarValor
);


module.exports = router;