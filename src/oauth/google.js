'use strict';

const superagent = require('superagent');
const Users = require('../../lib/models/users-schema.js');

const API = 'http://localhost:3010';
const GTS = 'https://www.googleapis.com/oauth2/v4/token';
const SERVICE = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

let authorize = (request) => {
  return superagent.post(GTS)
    .type('form')
    .send({
      code: request.query.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `${API}/oauth`,
      grant_type: 'authorization_code',
    })
    .then( response => {
      let access_token = response.body.access_token;
      return access_token;
    })
    .then(token => {
      return superagent.get(SERVICE)
        .set('Authorization', `Bearer ${token}`)
        .then( response => {
          let user = response.body;
          return user;
        });
    })
    .then( oauthUser => {
      return Users.createFromOauth(oauthUser.email);
    })
    .then( actualUser => {
      return actualUser.generateToken(); 
    })
    .catch( error => error );
};


module.exports = authorize;