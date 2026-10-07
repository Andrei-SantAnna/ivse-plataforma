// src/scripts/sincronizarIbge.js
require('dotenv').config();
const db = require('../config/database');

async function sincronizarMunicipiosBahia() {
  console.log('A buscar municípios da Bahia na API do IBGE...');
  
  try {
    // Usar a fetch API nativa do Node 20
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/BA/municipios');
    
    if (!response.ok) {
      throw new Error(`Erro na API do IBGE: ${response.statusText}`);
    }
    
    const municipiosIbge = await response.json();
    console.log(`${municipiosIbge.length} municípios encontrados. A iniciar verificação na base de dados...`);

    let inseridos = 0;
    let jaExistentes = 0;

    for (const mun of municipiosIbge) {
      const codigoIbge = mun.id.toString();
      const nome = mun.nome;

      // Verificar se o município já existe na nossa tabela
      const checkResult = await db.query('SELECT id FROM municipios WHERE codigo_ibge = $1', [codigoIbge]);
      
      if (checkResult.rows.length === 0) {
        // Inserir novo município
        await db.query(
          'INSERT INTO municipios (codigo_ibge, nome, uf) VALUES ($1, $2, $3)',
          [codigoIbge, nome, 'BA']
        );
        inseridos++;
      } else {
        jaExistentes++;
      }
    }

    console.log('Sincronização concluída com sucesso!!!');
    console.log(`Resumo: ${inseridos} inseridos | ${jaExistentes} já existiam.`);

  } catch (error) {
    console.error('Erro durante a sincronização:', error.message);
  } finally {
    process.exit(); // Encerra o script
  }
}

sincronizarMunicipiosBahia();