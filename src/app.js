'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');
const oauth = require('./oauth/google.js');
const auth = require('./utils/auth.js');

// Esoteric Resources
const errorHandler = require( './middleware/error.js');
const notFound = require( './middleware/404.js' );

// Models
const Moisture = require('../lib/models/moisture.js');
const moisture = new Moisture();

const socket = io.connect(process.env.SOCKET);

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/moisture', auth, getAllMoisture);
app.get('/moisture/:id', auth, getMoisture);

// OAuth
app.get('/oauth', (req, res, next) => {
  oauth(req)
    .then( token => {
      console.log('TOKEN: ', token);
      res.status(200).send(token);
    })
    .catch(next);
});

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

let moistureSensor = data => {
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
};

socket.on('moisture-data', moistureSensor);

module.exports = {
  server: app,
  start: port => {
    let PORT = port || 3008;
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  },
};
