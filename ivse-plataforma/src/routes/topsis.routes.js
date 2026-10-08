// src/routes/topsis.routes.js

const express = require('express');

const router = express.Router();

const topsisController =
  require('../controllers/topsis.controller');


// Simulação sem gravação
router.post(
  '/simular',
  topsisController.simular
);


// Execução oficial com gravação no banco
router.post(
  '/executar',
  topsisController.executarAnalise
);


// Histórico das análises
router.get(
  '/analises',
  topsisController.listarAnalises
);

router.get(
  '/analises/:id/relatorio',
  topsisController.obterRelatorio
);

module.exports = router;