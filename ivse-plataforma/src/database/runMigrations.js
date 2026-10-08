const fs = require('fs');
const path = require('path');

const db = require('../config/database');


async function executarMigrations() {

  const pasta =
    path.join(
      __dirname,
      'migrations'
    );


  try {

    const arquivos =
      fs
        .readdirSync(pasta)
        .filter(
          arquivo =>
            arquivo.endsWith('.sql')
        )
        .sort();


    console.log(
      `Encontradas ${arquivos.length} migrations.`
    );


    for (
      const arquivo
      of arquivos
    ) {

      const caminho =
        path.join(
          pasta,
          arquivo
        );


      const sql =
        fs.readFileSync(
          caminho,
          'utf8'
        );


      console.log(
        `Executando ${arquivo}...`
      );


      await db.query(sql);


      console.log(
        `✓ ${arquivo}`
      );

    }


    console.log(
      'Todas as migrations foram executadas com sucesso.'
    );


    process.exit(0);


  } catch (erro) {

    console.error(
      'Erro ao executar migrations:',
      erro
    );


    process.exit(1);

  }

}


executarMigrations();