require('dotenv').config();

const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const URL_COORDENADAS =
  'https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/municipios.csv';

async function sincronizarCoordenadasBahia() {
  console.log('========================================');
  console.log('SINCRONIZAÇÃO DE COORDENADAS - BAHIA');
  console.log('========================================');

  try {
    console.log('\n1. Baixando base de coordenadas...');

    const response = await fetch(URL_COORDENADAS);

    if (!response.ok) {
      throw new Error(
        `Erro ao baixar coordenadas: ${response.status} ${response.statusText}`
      );
    }

    const csv = await response.text();

    console.log('Base de coordenadas baixada.');

    // ---------------------------------------------------------
    // PROCESSAR CSV
    // ---------------------------------------------------------

    const linhas = csv
      .replace(/^\uFEFF/, '')
      .trim()
      .split(/\r?\n/);

    const cabecalho = linhas.shift().split(',');

    console.log('\nCabeçalho encontrado:');
    console.log(cabecalho);

    const indiceCodigoIbge = cabecalho.indexOf('codigo_ibge');
    const indiceNome = cabecalho.indexOf('nome');
    const indiceLatitude = cabecalho.indexOf('latitude');
    const indiceLongitude = cabecalho.indexOf('longitude');
    const indiceCodigoUf = cabecalho.indexOf('codigo_uf');

    if (
      indiceCodigoIbge === -1 ||
      indiceNome === -1 ||
      indiceLatitude === -1 ||
      indiceLongitude === -1 ||
      indiceCodigoUf === -1
    ) {
      throw new Error(
        'O CSV não possui todos os campos necessários.'
      );
    }

    // ---------------------------------------------------------
    // FILTRAR BAHIA
    // ---------------------------------------------------------

    console.log('\n2. Filtrando municípios da Bahia...');

    const coordenadasBahia = [];

    for (const linha of linhas) {
      const colunas = linha.split(',');

      const codigoUf = Number(colunas[indiceCodigoUf]);

      // Bahia = código IBGE da UF 29
      if (codigoUf !== 29) {
        continue;
      }

      const codigoIbge = Number(
        colunas[indiceCodigoIbge]
      );

      const nome = colunas[indiceNome];

      const latitude = Number(
        colunas[indiceLatitude]
      );

      const longitude = Number(
        colunas[indiceLongitude]
      );

      if (
        !codigoIbge ||
        !nome ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        console.warn(
          `Registro inválido ignorado: ${linha}`
        );

        continue;
      }

      coordenadasBahia.push({
        codigo_ibge: codigoIbge,
        nome: nome,
        latitude: latitude,
        longitude: longitude
      });
    }

    // ---------------------------------------------------------
    // VALIDAR 417 MUNICÍPIOS
    // ---------------------------------------------------------

    console.log(
      `\n✓ Municípios da Bahia encontrados: ${coordenadasBahia.length}`
    );

    if (coordenadasBahia.length !== 417) {
      throw new Error(
        `ERRO DE VALIDAÇÃO: esperados 417 municípios, ` +
        `mas foram encontrados ${coordenadasBahia.length}.`
      );
    }

    // ---------------------------------------------------------
    // VERIFICAR DUPLICADOS
    // ---------------------------------------------------------

    const codigos = coordenadasBahia.map(
      municipio => municipio.codigo_ibge
    );

    const codigosUnicos = new Set(codigos);

    if (codigosUnicos.size !== 417) {
      throw new Error(
        `Existem códigos IBGE duplicados. ` +
        `Encontrados ${codigosUnicos.size} códigos únicos.`
      );
    }

    console.log('Nenhum código IBGE duplicado.');

    // ---------------------------------------------------------
    // GERAR JSON
    // ---------------------------------------------------------

    const caminhoJson = path.join(
      __dirname,
      '../../municipios-bahia-coordenadas.json'
    );

    fs.writeFileSync(
      caminhoJson,
      JSON.stringify(coordenadasBahia, null, 2),
      'utf8'
    );

    console.log('\nArquivo JSON criado:');
    console.log(caminhoJson);

    // ---------------------------------------------------------
    // BUSCAR MUNICÍPIOS DO BANCO
    // ---------------------------------------------------------

    console.log('\n3. Verificando municípios no banco...');

    const resultado = await db.query(`
      SELECT
        id,
        codigo_ibge,
        nome
      FROM municipios
      WHERE uf = 'BA'
      ORDER BY nome
    `);

    const municipiosBanco = resultado.rows;

    console.log(
      `✓ Municípios encontrados no banco: ${municipiosBanco.length}`
    );

    if (municipiosBanco.length !== 417) {
      throw new Error(
        `O banco possui ${municipiosBanco.length} municípios da Bahia. ` +
        `Execute primeiro o sincronizarIbge.js.`
      );
    }

    // ---------------------------------------------------------
    // CRIAR MAPA PELO CÓDIGO IBGE
    // ---------------------------------------------------------

    const mapaCoordenadas = new Map();

    for (const municipio of coordenadasBahia) {
      mapaCoordenadas.set(
        String(municipio.codigo_ibge),
        municipio
      );
    }

    // ---------------------------------------------------------
    // ATUALIZAR POSTGIS
    // ---------------------------------------------------------

    console.log('\n4. Atualizando coordenadas no PostGIS...\n');

    let atualizados = 0;
    let naoEncontrados = 0;

    for (const municipio of municipiosBanco) {

      const coordenada = mapaCoordenadas.get(
        String(municipio.codigo_ibge)
      );

      if (!coordenada) {

        console.warn(
          ` Coordenada não encontrada: ` +
          `${municipio.nome} (${municipio.codigo_ibge})`
        );

        naoEncontrados++;

        continue;
      }

      await db.query(
        `
        UPDATE municipios
        SET coordenadas = ST_SetSRID(
          ST_MakePoint($1, $2),
          4326
        )
        WHERE id = $3
        `,
        [
          coordenada.longitude,
          coordenada.latitude,
          municipio.id
        ]
      );

      console.log(
        `✓ ${municipio.nome.padEnd(30)} ` +
        `${coordenada.latitude}, ${coordenada.longitude}`
      );

      atualizados++;
    }

    // ---------------------------------------------------------
    // RESULTADO
    // ---------------------------------------------------------

    console.log('\n========================================');
    console.log('SINCRONIZAÇÃO CONCLUÍDA');
    console.log('========================================');

    console.log(
      `Municípios na fonte:       ${coordenadasBahia.length}`
    );

    console.log(
      `Municípios no banco:       ${municipiosBanco.length}`
    );

    console.log(
      `Coordenadas atualizadas:   ${atualizados}`
    );

    console.log(
      `Não encontrados:           ${naoEncontrados}`
    );

    console.log('========================================');

    if (naoEncontrados > 0) {
      throw new Error(
        `Existem ${naoEncontrados} municípios sem coordenadas.`
      );
    }

    console.log(
      '\n✓ Todos os 417 municípios possuem coordenadas.'
    );

  } catch (error) {

    console.error('\nERRO:');
    console.error(error.message);

    process.exitCode = 1;

  } finally {

    await db.end?.();

  }
}

sincronizarCoordenadasBahia();