'use strict';

const User = require('../../lib/models/users-schema.js');

module.exports = (req, res, next) => {
  
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    switch( authType.toLowerCase() ) {
    case 'bearer':
      return _authBearer(authString);
    default: 
      return _authError();
    }
  }
  catch(e) {
    next(e);
  }

  function _authBearer(str) {
    console.log('STRING: ', str);
    return User.authenticateBearer(str)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  
  function _authError() {
    next('Invalid User ID/Password');
  }
};