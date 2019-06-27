'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usedTokens = new Set();

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
});

users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(console.error);
});

users.statics.createFromOauth = function(email) {
  if(! email) { return Promise.reject('Validation Error'); }

  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch( () => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });
};

users.methods.generateToken = function() {
  let token = {
    id: this._id,
    role: this.role,
  };
  console.log('TOKEN: ', token);
  console.log('SECRET: ', process.env.SECRET);
  return jwt.sign(token, process.env.SECRET);
};

users.statics.authenticateBearer = function(token) {
  console.log('BEARER');
  // Parse the token
  let parsedToken = jwt.verify(token, process.env.SECRET);

  parsedToken.type !== 'key' && usedTokens.add(token);

  // Get the id
  let query = {_id: parsedToken.id};

  // Find the user
  return this.findOne(query);
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

users.methods.generateToken = function(type) {
  
  let token = {
    id: this._id,
    role: this.role,
    type: type || 'user',
  };

  let options = {};

  if (token.type === 'user') {
    options = {expiresIn: process.env.EXPIRE_TIME};
  }
  
  return jwt.sign(token, process.env.SECRET, options);
};

module.exports = mongoose.model('users', users);
