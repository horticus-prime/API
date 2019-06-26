'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');

// Esoteric Resources
const errorHandler = require( './middleware/error.js');
const notFound = require( './middleware/404.js' );

// Models
const Moisture = require('../lib/models/moisture.js');
const moisture = new Moisture();

// Prepare the express app

const socket = io.connect('http://localhost:3005');

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
app.use(express.static('docs'));
app.use('/docs', express.static('docs'));

// Routes
app.get('/moisture', getAllMoisture);
app.get('/moisture/:id', getMoisture);
app.post('/moisture', postData);

// Catchalls
app.use(notFound);
app.use(errorHandler);

// Constructor 
function MoistureData(data) {
  this.moistureCategory = data.moistureCategory;
  this.timestamp = data.timestamp;
  this.moistureNumber = data.moistureNumber;
}

// Route handlers
function getAllMoisture(request,response,next) {
  // expects an array of object to be returned from the model
  moisture.get()
    .then( result => {
      socket.emit('req-data', result);
      response.status(200).json(result);
    })
    .catch( next );
}

function getMoisture(request,response,next) {
  // expects an array with the one matching record from the model
  moisture.get(request.params.id)
    .then( result => {
      socket.emit('req-data', result);
      response.status(200).json(result[0]); 
    })
    .catch( next );
}

function postData(req, res) {
  let constructedData = new MoistureData(req.body);
  console.log(constructedData);

  moisture.post(constructedData)
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.error(error);
    });
}

let moistureSensor = data => {
  if (data) {
    let constructedData = new MoistureData(data);

    moisture.post(constructedData)
      .then(response => {
        // emit save
        socket.emit('save-status', response);
      })
      .catch(error => {
        // emit error
        socket.emit('save-status', error);
      });
  } else {
    // emit error
    socket.emit('save-status', data);
  }
};

socket.on('moisture-sensor', moistureSensor);

module.exports = {
  server: app,
  start: port => {
    let PORT = port || 3008;
    console.log('Hello World!');
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  },
};
