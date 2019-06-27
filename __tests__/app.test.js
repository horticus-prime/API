'use strict';

process.env.STORAGE = 'mongo';

const server = require('../src/app.js').server;

const supergoose = require('./supergoose.js');

const mockRequest = supergoose.server(server);

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('api server', () => {
  it('should respond with a 404 on an invalid route', () => {
    return mockRequest
      .get('/foo')
      .then(results => {
        expect(results.status).toBe(404);
      });
  });
});

