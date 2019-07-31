'use strict';

const schema = require('./users-schema.js');

class Users {

  constructor() {
  }

  get(_id) {
    let queryObject = _id ? {_id} : {};
    return schema.find(queryObject);
  }
  
  post(record) {
    console.log('record', record);
    let entry = new schema(record);
    return entry.save();
  }

  put(_id, record) {
    console.log(_id, record);
    return schema.findByIdAndUpdate(_id, record, {new: true});
  }

  delete(_id) {
    return schema.findByIdAndDelete(_id);
  }

}

module.exports = Users;
