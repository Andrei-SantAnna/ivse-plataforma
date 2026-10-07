// src/routes/indicador.routes.js
const express = require('express');
const router = express.Router();
const indicadorController = require('../controllers/indicador.controller');

// Rotas para a definição dos indicadores
router.post('/', indicadorController.criarIndicador);
router.get('/', indicadorController.listarIndicadores);

// Rotas para os valores dos indicadores por município
router.post('/valores', indicadorController.adicionarValor);

module.exports = router;