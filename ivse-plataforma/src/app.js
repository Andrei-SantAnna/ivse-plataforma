const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors()); // Autoriza o React (porto 5173) a comunicar com a API (porto 3000)
app.use(express.json());

// Importação das Rotas
const municipioRoutes = require('./routes/municipio.routes');
const indicadorRoutes = require('./routes/indicador.routes');
const topsisRoutes = require('./routes/topsis.routes');

// Rota de Health Check (usada pelo Dashboard do React)
app.get('/api/health', (req, res) => {
  res.json({ banco_de_dados: 'Conectado', status: 'ok' });
});

// Configuração dos Endpoints principais
app.use('/api/municipios', municipioRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/topsis', topsisRoutes);

module.exports = app;