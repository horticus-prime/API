'use strict';

const mongoose = require('mongoose');
/**
*404 Error
* @module export 
* @param {Object} req - Request Object
* @param {Object} res - Resonse Object
* @desc Returns a 404 error if it could not find the page
 */
 
const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
});

module.exports = mongoose.model('users', users);
