'use strict';

process.env.STORAGE = 'mongo';

const server = require('../../src/app.js').server;
const supergoose = require('../supergoose.js');
const moisture = require('../../lib/models/moisture');

const mockRequest = supergoose.server(server);

let moistureData = {
  timestamp: {type: String, required: true},
  moistureCategory: {type: String, required: true},
  moistureNumber: {type: String, required: true},
}

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('moisture model', () => {

  it('can post() a new Data', () => {
    let moist = new moisture;
    let data = {timestamp:'07/11/2011', moistureCategory: 'WET', moistureNumber: '789'};
    return moist.post(data)
      .then(record => {
        Object.keys(data).forEach(key =>{
          expect(record[key]).toEqual(data[key]);
        });
      });
  });

  it('can get data', () => {
    let moist = new moisture;
    let data = {timestamp:'07/11/2011', moistureCategory: 'WET', moistureNumber: '789'};
    return moist.post(data)
      .then(record => {
        return moist.get(record._id)
          .then(information => {
            Object.keys(data).forEach(key => {
              expect(information[0][key]).toEqual(data[key]);
            })
          })
      })
  })
})