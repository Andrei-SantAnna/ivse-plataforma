const topsisService =
  require('../../src/services/topsis.service');

describe(
  'Desempenho do TOPSIS',
  () => {

    test(
      'deve processar 500 municípios e 10 indicadores em menos de 5 segundos',
      () => {

        const quantidadeMunicipios =
          500;

        const quantidadeIndicadores =
          10;


        const matriz =
          Array.from(
            {
              length:
                quantidadeMunicipios
            },
            (_, i) =>

              Array.from(
                {
                  length:
                    quantidadeIndicadores
                },
                (_, j) =>
                  (
                    (i + 1) *
                    (j + 2)
                  ) % 100 + 1
              )
          );


        const pesos =
          Array(
            quantidadeIndicadores
          ).fill(1);


        const tipos =
          Array.from(
            {
              length:
                quantidadeIndicadores
            },
            (_, index) =>
              index % 2 === 0
                ? 'beneficio'
                : 'custo'
          );


        const alternativas =
          Array.from(
            {
              length:
                quantidadeMunicipios
            },
            (_, index) => ({
              id:
                index + 1,

              nome:
                `Municipio ${index + 1}`
            })
          );


        const inicio =
          performance.now();


        const resultado =
          topsisService.calcular(
            matriz,
            pesos,
            tipos,
            alternativas
          );


        const fim =
          performance.now();


        const tempoMs =
          fim - inicio;


        console.log(
          `Tempo TOPSIS 500x10: ${tempoMs.toFixed(2)} ms`
        );


        expect(
          resultado
        ).toHaveLength(
          quantidadeMunicipios
        );


        expect(
          tempoMs
        ).toBeLessThan(
          5000
        );

      }
    );

  }
);