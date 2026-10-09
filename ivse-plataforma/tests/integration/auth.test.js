const request = require('supertest');

const app = require('../../src/server');


describe(
  'Autenticação',
  () => {

    test(
      'POST /api/auth/login deve rejeitar credenciais inválidas',
      async () => {

        const response =
          await request(app)
            .post('/api/auth/login')
            .send({
              email:
                'inexistente@ivse.com',

              senha:
                'senha_incorreta'
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


    test(
      'GET /api/auth/me deve rejeitar requisição sem token',
      async () => {

        const response =
          await request(app)
            .get('/api/auth/me');


        expect(
          response.status
        ).toBe(401);

      }
    );

  }
);