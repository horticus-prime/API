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

  it('should be able to post to a valid model', ()  => {

    let data = {timestamp:'07/11/2011', moistureCategory: 'WET', moistureNumber: '789'};
    return mockRequest
      .post('/moisture')
      .send(data)
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body).toEqual(data);
      });
  });


  it('following a post to a valid model, should find a single record', () => {
    let data = {timestamp:'07/11/2011', moistureCategory: 'WET', moistureNumber: '789'};
    return mockRequest
      .post('/moisture')
      .send(data)
      .then(results => {
        return mockRequest.get(`/moisture/${results.body._id}`)
          .then(list => {
            expect(list.status).toBe(200);
            expect(list.body).toEqual(data);
          });
      });
  });


});

