const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'API IVSE',
      version: '1.0.0',
      description:
        'API da Plataforma de Avaliação de Vulnerabilidade Social Energética utilizando TOPSIS.'
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },

    tags: [
      {
        name: 'Autenticação',
        description: 'Login e controle de usuários'
      },
      {
        name: 'Municípios',
        description: 'Gerenciamento dos municípios'
      },
      {
        name: 'Indicadores',
        description: 'Gerenciamento dos indicadores'
      },
      {
        name: 'TOPSIS',
        description: 'Execução e consulta das análises TOPSIS'
      }
    ]
  },

  apis: [
    './src/routes/*.js'
  ]
};

const swaggerSpec =
  swaggerJsdoc(options);

module.exports =
  swaggerSpec;