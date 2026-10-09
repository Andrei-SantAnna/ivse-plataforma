const request = require('supertest');

const app = require('../../src/server');


describe(
  'API TOPSIS',
  () => {

    test(
      'GET /api/topsis/analises deve responder',
      async () => {

        const response =
          await request(app)
            .get('/api/topsis/analises');


        expect(
          [
            200,
            401
          ]
        ).toContain(
          response.status
        );

      }
    );


    test(
      'POST /api/topsis/executar deve rejeitar payload inválido',
      async () => {

        const response =
          await request(app)
            .post('/api/topsis/executar')
            .send({
              titulo:
                '',

              ano_referencia:
                2026,

              criterios: []
            });


        expect(
          [
            400,
            401
          ]
        ).toContain(
          response.status
        );

      }
    );

  }
);