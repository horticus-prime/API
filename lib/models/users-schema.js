'use strict';

const mongoose = require('mongoose');
/**
*Create a new User Schema
* @name module:Schema#users
* @desc Saves a username, password, and email to the users database
*/

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
});

/**
* @module exports Users
*/
module.exports = mongoose.model('users', users);
