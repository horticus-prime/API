'use strict';

/**
* @module src/app
 */
const cwd = process.cwd();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');
const moment = require('moment');
const cron = require('node-cron');

// Esoteric Resources
const errorHandler = require( `${cwd}/src/middleware/error.js`);
const notFound = require( `${cwd}/src/middleware/404.js` );
const authRouter = require(`${cwd}/src/auth/router.js`);

// Models
const Moisture = require('../lib/models/moisture.js');
const moisture = new Moisture();
const Users = require('../lib/models/users.js');
const users = new Users();

let MongoClient = require('mongodb').MongoClient;

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
// app.get('/moisture', getAllMoisture);

/**
* @method get
* @route GET /moisture/{id}
 */
app.get('/moisture', getMoisture);
app.get('/user', getUser);
app.post('/user', addUser);
app.put('/user/:id', editUser);
app.delete('/user/:id', deleteUser);

// Catchalls
app.use(notFound);
app.use(errorHandler);

// Route handlers

/**
 * @function getAllMoisture - gets all the moisture data
 * @param {Object} request - request
 * @param {Object} response - response
 * @param {Function} next - Express next middleware function
 */

function getUser(req, res, next) {
  console.log('hello');
  users.get()
    .then(result => {
      res.send(result);
    });
}

function addUser(req, res, next) {
  let payload = req.body;

  users.post(payload)
    .then(result => {
      res.send(result);
    });
}

function editUser(req, res, next) {
  users.put(req.params.id, req.body)
    .then(result => {
      res.send(result);
    });
}

function deleteUser(req, res, next) {
  users.delete(req.params.id)
    .then(result => {
      res.send(result);
    });
}

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
  let query = { year: request.body.year, month: request.body.month, day: request.body.day };

  // moisture.get(query)
  //   .then( result => {
  //     response.status(200).send(result); 
  //   })
  //   .catch( next );

  MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    var dbo = db.db('moisture');
    dbo.collection('moistures').find(query).toArray(function(err, result) {
      console.log(result);
      response.status(200).send(result);
    });
  });
}

/**
 * MoistureSensor emits events for data events associated with the database
 * @param data - data object from soils 
 */

let arr = [];

let aggregator = data => {
  console.log('number', data);
  arr.push(Number(data.val));
};

cron.schedule('*/10 * * * * *', function() {
  if (arr.length > 0) {
    let newArr = arr;
    let length = newArr.length;
    arr = [];

    let total = newArr.reduce((acc, cur) => {
      acc += cur;

      return acc;
    }, 0);

    total = total / length;

    let obj = {moistureNumber: total, timestamp: new Date()};
    
    moistureSensor(obj);
  }
});

let moistureSensor = data => {
  // Query
  MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    console.log('data', data);
    var dbo = db.db('moisture');
    const query = { year: moment().format('YYYY'), month: moment().format('MM'), day: moment().format('DD') };
    dbo.collection('moistures').find(query).toArray(function(err, result) {
      console.log(result);
      if (result && result.length === 0) {
        moisture.post(query)
          .then(() => {
            dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data  } });
          });
      } else {
        dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data  } });
      }
    });
  });
};

socket.on('moisture-data', aggregator);

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
