const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/estatisticas', dashboardController.getEstatisticas);

module.exports = router;