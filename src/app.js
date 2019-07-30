'use strict';

/**
* @module src/app
 */
const cwd = process.cwd();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');

// Esoteric Resources
const errorHandler = require( `${cwd}/src/middleware/error.js`);
const notFound = require( `${cwd}/src/middleware/404.js` );
const authRouter = require(`${cwd}/src/auth/router.js`);

// Models
const Moisture = require('../lib/models/moisture.js');
const moisture = new Moisture();

// Prepare the express app
const socket = io.connect(process.env.SOCKET);

const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// swagger
const options = require('../docs/config/swagger');
const expressSwagger = require('express-swagger-generator')(app);
expressSwagger(options);

// jsdoc
app.use(express.urlencoded({extended:true}));
app.use('/docs', express.static('docs'));

//Routes
app.use(authRouter);

// Routes

/**
* @method get
* @route GET /{moisture}
 */
app.get('/moisture', getAllMoisture);

/**
* @method get
* @route GET /moisture/{id}
 */
app.get('/moisture/:id', getMoisture);

// Catchalls
app.use(notFound);
app.use(errorHandler);

// Constructor 

function MoistureData(data) {
  /**
  * @function MoistureData
  * @param {Object} - moisture data:
  * @desc A string of describing categorization of (wet, moist, dry)
  * @type {string} 
  */
  
  this.moistureCategory = data.moistureCategory;

  /** 
   * A time stamp for when data was inserted in the database
   * @type {date}
   */  

  this.timestamp = data.timestamp;

  /**
  * A number correlated with the category
  * @type {string}
  */

  this.moistureNumber = data.moistureNumber;
}


// Route handlers

/**
 * @function getAllMoisture - gets all the moisture data
 * @param {Object} request - request
 * @param {Object} response - response
 * @param {Function} next - Express next middleware function
 */

function getAllMoisture(request, response, next) {
  
  /**
  * @method get - middleware function 
  * @desc Gets all the moisture data. After which it emits the data via  *     a socket and simultaneously sends a 200 server response
  * 
  */ 

  moisture.get()
    .then( result => {
      socket.emit('req-data', result);
      let obj = {
        count: result.length,
        data: result,
      };
      response.status(200).json(obj);
    })
    .catch( next );
}

/**
 * @function getMoisture - gets one moisture data point
 * @param request - request
 * @param response - response
 * @param {Function} next - Express next middleware function
 * @returns {Object} 200 - valid result
 * @desc This function expects an array with the one matching record from the model
 */

function getMoisture(request, response, next) {
  
  /**
  * @method get - testing
  * @desc This method retrieves information based on a single data id
  * @param request.params.id - the unique id for a singular data point
  * @param {Function} next - Express next middleware function
  * @returns {Object} 200 - valid result
  */

  moisture.get(request.params.id)
    .then( result => {
      socket.emit('req-data', result);
      response.status(200).json(result[0]); 
    })
    .catch( next );
}

/**
 * MoistureSensor emits events for data events associated with the database
 * @param data - data object from soils 
 */

let moistureSensor = data => {
  let constructedData = new MoistureData(data);

  moisture.post(constructedData)
    .then(response => {
      console.log('SAVED');
      console.log(response);
      // emit save
      socket.emit('save-status', response);
    })
    .catch(error => {
      console.log('ERROR');
      console.log(error);
      // emit error
      socket.emit('save-status', error);
    }); 
};

socket.on('moisture-data', moistureSensor);

/**
 * @module User Exports the module to the Port
 */

module.exports = {
  server: app,
  start: port => {
    let PORT = port || 3008;
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  },
};
