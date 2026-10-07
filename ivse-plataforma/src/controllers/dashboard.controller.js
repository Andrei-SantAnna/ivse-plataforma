const db = require('../config/database');

exports.getEstatisticas = async (req, res) => {
  try {
    const totalMunicipios = await db.query('SELECT COUNT(*) FROM municipios');
    const totalAnalises = await db.query('SELECT COUNT(*) FROM analises');
    
    res.json({
      municipios: parseInt(totalMunicipios.rows[0].count),
      analises: parseInt(totalAnalises.rows[0].count)
    });
  } catch (erro) {
    console.error('Erro ao buscar estatísticas:', erro);
    res.status(500).json({ erro: 'Falha ao carregar dados do dashboard.' });
  }
};