'use strict';

/**
*404 Error
* @module export 
* @param {Object} req - Request Object
* @param {Object} res - Resonse Object
* @desc Returns a 404 error if it could not find the page
 */
 
module.exports = (req,res) => {
  let error = { error: 'Resource Not Found' };
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
