'use strict';

const schema = require('./products-schema.js');

class Products {

  constructor() {
    this.database = [];
  }

  get(_id) {
    let queryObject = _id ? {_id} : {};
    return schema.find(queryObject);
    
  }
  
  post(entry) {
    let record = new schema(entry);
    return record.save();
  }

  put(_id, entry) {
    return schema.findByIdAndUpdate(_id, entry, {new: true});
  }

  delete(_id) {
    return schema.findByIdAndDelete(_id);
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

module.exports = Products;