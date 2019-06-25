'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');

// Esoteric Resources
const errorHandler = require( './middleware/error.js');
const notFound = require( './middleware/404.js' );

// Models
const Moisture = require('./models/moisture.js');
const moisture = new Moisture();

const socket = io.connect('http://localhost:3005');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/moisture', getAllMoisture);
app.get('/moisture/:id', getMoisture);

// Catchalls
app.use(notFound);
app.use(errorHandler);

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

// Constructor 
function MoistureData(data) {
  this.id = data.id;
  this.int = data.int;
  this.message = data.message;
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
  } else if (error) {
    // emit error
    socket.emit('save-status', error);
  }
};

socket.on('moisture-sensor', moistureSensor);

module.exports = {
  server: app,
  start: port => {
    let PORT = port || 3006;
    console.log('Hello World!');
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  },
};
