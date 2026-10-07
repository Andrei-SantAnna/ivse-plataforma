// src/routes/municipio.routes.js
const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipio.controller');

// Rota para listar todos os municípios (GET /api/municipios)
router.get('/', municipioController.listar);

// Rota para cadastrar um novo município (POST /api/municipios)
router.post('/', municipioController.criar);

module.exports = router;