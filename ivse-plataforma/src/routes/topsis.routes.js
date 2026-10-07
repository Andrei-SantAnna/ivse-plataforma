// src/routes/topsis.routes.js
const express = require('express');
const router = express.Router();
const topsisController = require('../controllers/topsis.controller');

router.post('/simular', topsisController.simular);
router.post('/executar', topsisController.executarAnalise); // <-- Nova rota de produção

module.exports = router;