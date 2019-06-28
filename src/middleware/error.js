'use strict';

/**
* 500 Error
* @module export 
* @param {Object} req - Request Object
* @param {Object} res - Resonse Object
* @desc Returns a server error if something is wrong with the server
 */
module.exports = (err, req, res) => {
  let error = { error: err };
  res.statusCode = 500;
  res.statusMessage = 'Server Error';
  res.setHeader('Content-Type', 'application/json');
  res.write( JSON.stringify(error) );
  res.end();
};