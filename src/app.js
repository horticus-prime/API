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
app.get('/moistures', getAllMoisture);
app.get('/moisture', getMoistureByDate);
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

  moisture.getAll()
    .then( result => {
      response.status(200).send(result);
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

function getMoistureByDate(request, response, next) {

  // moisture.get(query)
  //   .then( result => {
  //     response.status(200).send(result); 
  //   })
  //   .catch( next );

  console.log(request.query);


  moisture.getByDate(request.query.year, request.query.month, request.query.day)
    .then(result => {
      response.status(200).send(result);
    })
    .catch(err => {
      response.send(err);
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
  // get by year month day
  moisture.getByDate(moment().format('YYYY'), moment().format('MM'), moment().format('DD'))
    .then(result => {
      if (result && result.length > 0) {
        // If yes, 
        //then push into reads array and call put with id and payload
        result[0].reads.push(data);
        moisture.put({year: result[0].year, month: result[0].month, day: result[0].day}, result[0]);
      } else {
        // else 
        // call new Moisture();
        let payload = {
          year: moment().format('YYYY'),
          month: moment().format('MM'),
          day: moment().format('DD'),
          reads: [data],
        };
        // call post
        moisture.post(payload);
      }
    });


  // Query
  // MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, function(err, db) {
  //   console.log('data', data);
  //   console.log('mongodb_uri', process.env.MONGODB_URI);
  //   var dbo = db.db('moisture');
  //   const query = { year: moment().format('YYYY'), month: moment().format('MM'), day: moment().format('DD') };
  //   dbo.collection('moistures').find(query).toArray(function(err, result) {
  //     console.log(result);
  //     if (result && result.length === 0) {
  //       moisture.post(query)
  //         .then(() => {
  //           dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data  } });
  //         });
  //     } else {
  //       dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data  } });
  //     }
  //   });
  // });
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
