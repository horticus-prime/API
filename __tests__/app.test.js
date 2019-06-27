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

  it('should not be able to post to a invalid model', ()  => {

    let data = {timestamp:'13/1011/35', moistureCategory: 'Muddy', moistureNumber: '53490'};
    return mockRequest
      .post('/dirt')
      .send(data)
      .then(results => {
        expect(results.status).toBe(404);
      });
  });
});