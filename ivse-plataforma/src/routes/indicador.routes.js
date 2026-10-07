const express = require('express');

const router = express.Router();

const indicadorController =
  require('../controllers/indicador.controller');

const upload =
  require('../middlewares/upload');


router.get(
  '/',
  indicadorController.listar
);


router.post(
  '/',
  indicadorController.criar
);


router.post(
  '/valores',
  indicadorController.adicionarValor
);


router.post(
  '/importar-csv',
  upload.single('arquivo'),
  indicadorController.importarCSV
);


module.exports = router;