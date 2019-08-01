'use strict';

const schema = require('./moisture-schema.js');

class Moisture {
  constructor() {
  }

  get(_id) {
    let queryObject = _id ? {_id} : {};
    return schema.find(queryObject);
  }

  getByDate(year, month, day) {
    let queryObject = {year, month, day};

    return schema.find(queryObject);
  }
  
  post(entry) {
    let record = new schema(entry);
    return record.save();
  }

  put(query, record) {
    return schema.findOneAndUpdate(query, record, {new: true})
      .then(result => {
        console.log('res', result);
      });
  }
}

module.exports = Moisture;