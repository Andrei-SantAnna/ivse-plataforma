const topsisService =
  require('../../src/services/topsis.service');


describe(
  'TopsisService',
  () => {

    // ==========================================================
    // NORMALIZAÇÃO
    // ==========================================================

    test(
      'deve normalizar corretamente uma matriz simples',
      () => {

        const matriz = [
          [3, 4],
          [4, 3]
        ];


        const resultado =
          topsisService._normalizar(
            matriz,
            2,
            2
          );


        expect(
          resultado[0][0]
        ).toBeCloseTo(
          0.6,
          6
        );


        expect(
          resultado[1][0]
        ).toBeCloseTo(
          0.8,
          6
        );


        expect(
          resultado[0][1]
        ).toBeCloseTo(
          0.8,
          6
        );


        expect(
          resultado[1][1]
        ).toBeCloseTo(
          0.6,
          6
        );

      }
    );


    test(
      'deve retornar zero quando uma coluna inteira for zero',
      () => {

        const matriz = [
          [0, 10],
          [0, 20]
        ];


        const resultado =
          topsisService._normalizar(
            matriz,
            2,
            2
          );


        expect(
          resultado[0][0]
        ).toBe(0);


        expect(
          resultado[1][0]
        ).toBe(0);

      }
    );


    // ==========================================================
    // IDEAIS
    // ==========================================================

    test(
      'deve calcular corretamente os ideais para critérios benefício',
      () => {

        const matrizPonderada = [
          [0.3, 0.4],
          [0.5, 0.2]
        ];


        const resultado =
          topsisService._calcularIdeais(
            matrizPonderada,
            [
              'beneficio',
              'beneficio'
            ],
            2,
            2
          );


        expect(
          resultado.idealPositiva
        ).toEqual(
          [
            0.5,
            0.4
          ]
        );


        expect(
          resultado.idealNegativa
        ).toEqual(
          [
            0.3,
            0.2
          ]
        );

      }
    );


    test(
      'deve calcular corretamente os ideais para critérios custo',
      () => {

        const matrizPonderada = [
          [0.3, 0.4],
          [0.5, 0.2]
        ];


        const resultado =
          topsisService._calcularIdeais(
            matrizPonderada,
            [
              'custo',
              'custo'
            ],
            2,
            2
          );


        expect(
          resultado.idealPositiva
        ).toEqual(
          [
            0.3,
            0.2
          ]
        );


        expect(
          resultado.idealNegativa
        ).toEqual(
          [
            0.5,
            0.4
          ]
        );

      }
    );


    test(
      'deve respeitar combinação de benefício e custo',
      () => {

        const matrizPonderada = [
          [0.2, 0.7],
          [0.8, 0.3]
        ];


        const resultado =
          topsisService._calcularIdeais(
            matrizPonderada,
            [
              'beneficio',
              'custo'
            ],
            2,
            2
          );


        expect(
          resultado.idealPositiva
        ).toEqual(
          [
            0.8,
            0.3
          ]
        );


        expect(
          resultado.idealNegativa
        ).toEqual(
          [
            0.2,
            0.7
          ]
        );

      }
    );


    test(
      'deve rejeitar tipo de critério inválido',
      () => {

        const matrizPonderada = [
          [0.2],
          [0.8]
        ];


        expect(
          () =>
            topsisService._calcularIdeais(
              matrizPonderada,
              [
                'invalido'
              ],
              2,
              1
            )
        ).toThrow(
          'Tipo de critério inválido'
        );

      }
    );


    // ==========================================================
    // EXECUÇÃO COMPLETA
    // ==========================================================

    test(
      'deve executar TOPSIS e retornar ranking ordenado',
      () => {

        const matriz = [
          [9, 1],
          [6, 4],
          [3, 8]
        ];


        const pesos = [
          1,
          1
        ];


        const tipos = [
          'beneficio',
          'custo'
        ];


        const alternativas = [
          {
            id: 1,
            nome: 'Município A'
          },
          {
            id: 2,
            nome: 'Município B'
          },
          {
            id: 3,
            nome: 'Município C'
          }
        ];


        const resultado =
          topsisService.calcular(
            matriz,
            pesos,
            tipos,
            alternativas
          );


        expect(
          resultado
        ).toHaveLength(3);


        expect(
          resultado[0].municipio.nome
        ).toBe(
          'Município A'
        );


        expect(
          resultado[0].posicao_ranking
        ).toBe(1);


        expect(
          resultado[2].municipio.nome
        ).toBe(
          'Município C'
        );

      }
    );


    test(
      'todos os scores devem permanecer entre zero e um',
      () => {

        const matriz = [
          [10, 20],
          [20, 10],
          [15, 15]
        ];


        const resultado =
          topsisService.calcular(
            matriz,
            [
              1,
              1
            ],
            [
              'beneficio',
              'custo'
            ],
            [
              'A',
              'B',
              'C'
            ]
          );


        resultado.forEach(
          item => {

            expect(
              item.ivse_score
            ).toBeGreaterThanOrEqual(0);


            expect(
              item.ivse_score
            ).toBeLessThanOrEqual(1);

          }
        );

      }
    );


    test(
      'ranking deve estar em ordem decrescente de IVSE',
      () => {

        const matriz = [
          [10, 5],
          [8, 7],
          [5, 10]
        ];


        const resultado =
          topsisService.calcular(
            matriz,
            [
              1,
              1
            ],
            [
              'beneficio',
              'custo'
            ],
            [
              'A',
              'B',
              'C'
            ]
          );


        for (
          let i = 0;
          i <
          resultado.length - 1;
          i++
        ) {

          expect(
            resultado[i]
              .ivse_score
          ).toBeGreaterThanOrEqual(
            resultado[
              i + 1
            ].ivse_score
          );

        }

      }
    );


    test(
      'deve retornar IVSE zero quando D+ e D- forem zero',
      () => {

        const matriz = [
          [5, 5],
          [5, 5]
        ];


        const resultado =
          topsisService.calcular(
            matriz,
            [
              1,
              1
            ],
            [
              'beneficio',
              'beneficio'
            ],
            [
              'A',
              'B'
            ]
          );


        expect(
          resultado[0]
            .ivse_score
        ).toBe(0);


        expect(
          resultado[1]
            .ivse_score
        ).toBe(0);

      }
    );


    // ==========================================================
    // VALIDAÇÕES
    // ==========================================================

    test(
      'deve rejeitar matriz vazia',
      () => {

        expect(
          () =>
            topsisService.calcular(
              [],
              [
                1
              ],
              [
                'beneficio'
              ],
              []
            )
        ).toThrow(
          'Erro de dimensão'
        );

      }
    );


    test(
      'deve rejeitar quantidade de pesos diferente das colunas',
      () => {

        const matriz = [
          [
            10,
            20
          ],
          [
            30,
            40
          ]
        ];


        expect(
          () =>
            topsisService.calcular(
              matriz,
              [
                1
              ],
              [
                'beneficio'
              ],
              [
                'A',
                'B'
              ]
            )
        ).toThrow(
          'Erro de dimensão'
        );

      }
    );


    // ==========================================================
    // FORMATO DO RESULTADO
    // ==========================================================

    test(
      'deve retornar distâncias com oito casas decimais',
      () => {

        const resultado =
          topsisService.calcular(
            [
              [
                10,
                20
              ],
              [
                20,
                10
              ]
            ],
            [
              1,
              1
            ],
            [
              'beneficio',
              'beneficio'
            ],
            [
              'A',
              'B'
            ]
          );


        resultado.forEach(
          item => {

            expect(
              item.distancia_positiva
            ).toMatch(
              /^\d+\.\d{8}$/
            );


            expect(
              item.distancia_negativa
            ).toMatch(
              /^\d+\.\d{8}$/
            );

          }
        );

      }
    );

  }
);