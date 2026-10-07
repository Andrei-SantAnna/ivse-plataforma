require('dotenv').config();
const db = require('../config/database');

async function sincronizarMunicipiosBahia() {
  console.log('A buscar municípios da Bahia na API do IBGE...');

  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados/BA/municipios'
    );

    if (!response.ok) {
      throw new Error(
        `Erro na API do IBGE: ${response.status} ${response.statusText}`
      );
    }

    const municipiosIbge = await response.json();

    console.log(
      `${municipiosIbge.length} municípios encontrados na API do IBGE.`
    );

    if (municipiosIbge.length !== 417) {
      throw new Error(
        `Esperados 417 municípios da Bahia, mas a API retornou ${municipiosIbge.length}.`
      );
    }

    let inseridos = 0;
    let jaExistentes = 0;

    for (const mun of municipiosIbge) {
      const codigoIbge = mun.id.toString();
      const nome = mun.nome;

      const checkResult = await db.query(
        'SELECT id FROM municipios WHERE codigo_ibge = $1',
        [codigoIbge]
      );

      if (checkResult.rows.length === 0) {
        await db.query(
          `
          INSERT INTO municipios
            (codigo_ibge, nome, uf)
          VALUES
            ($1, $2, $3)
          `,
          [codigoIbge, nome, 'BA']
        );

        console.log(`✓ Inserido: ${nome} (${codigoIbge})`);

        inseridos++;
      } else {
        jaExistentes++;
      }
    }

    console.log('\n========================================');
    console.log('SINCRONIZAÇÃO IBGE CONCLUÍDA');
    console.log('========================================');
    console.log(`Municípios encontrados: ${municipiosIbge.length}`);
    console.log(`Inseridos: ${inseridos}`);
    console.log(`Já existentes: ${jaExistentes}`);
    console.log('========================================');

  } catch (error) {
    console.error('\n Erro durante a sincronização:');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await db.end?.();
  }
}

sincronizarMunicipiosBahia();