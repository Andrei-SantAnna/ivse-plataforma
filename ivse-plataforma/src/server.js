const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const topsisRoutes = require('./routes/topsis.routes');
const indicadorRoutes = require('./routes/indicador.routes');
const authRoutes = require('./routes/auth.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Importação das rotas
const municipioRoutes = require('./routes/municipio.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as data_servidor');
    res.status(200).json({
      status: 'online',
      banco_de_dados: 'Conectado',
      timestamp: result.rows[0].data_servidor
    });
  } catch (erro) {
    res.status(500).json({ status: 'erro', detalhe: erro.message });
  }
});

// Registro das rotas da API
app.use('/api/municipios', municipioRoutes);
app.use('/api/topsis', topsisRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/auth', authRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Servidor a executar na porta ${PORT}`);
});