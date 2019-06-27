'use strict';

const schema = require('./moisture-schema.js');

class Moisture {
  constructor() {
  }

  get(_id) {
    let queryObject = _id ? {_id} : {};
    return schema.find(queryObject);
    
  }
  
  post(entry) {
    let record = new schema(entry);
    return record.save();
  }
}

module.exports = Moisture;