'use strict';

module.exports = {
  swaggerDefinition: {
    info: {
      description: 'API Server',
      title: 'Swagger doc page',
      version: '0.0.1',
    },
    basePath: '/',
    produces: [
      'application/json',
    ],
    host: 'localhost:3006',
    schemes: ['http'],
    securityDefinitions: {
      basicAuth: {
        type: 'basic',
      },
    },
  },
  basedir: __dirname,
  files: ['../../src/app.js'],
};
