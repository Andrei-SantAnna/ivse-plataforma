const request = require('supertest');

const app = require('../../src/server');


describe(
  'GET /health',
  () => {

    test(
      'deve retornar status 200',
      async () => {

        const response =
          await request(app)
            .get('/health');


        expect(
          response.status
        ).toBe(200);

      }
    );

  }
);