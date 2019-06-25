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

  sanitize(entry) {
    let valid = true;
    let record = {};

    Object.keys(schema).forEach(item => {
      if(schema[item].required){
        if(entry[item]){
          record[item] = entry[item];
        } else {
          valid = false;
        }
      } else {
        record[item] = entry[item];
      }
    });
    return valid ? record : undefined;
  }

}

module.exports = Moisture;