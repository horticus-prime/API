'use strict';

const cwd = process.cwd();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const io = require('socket.io-client');
const moment = require('moment');
const cron = require('node-cron');

// Esoteric Resources
const errorHandler = require(`${cwd}/src/middleware/error.js`);
const notFound = require(`${cwd}/src/middleware/404.js`);
const authRouter = require(`${cwd}/src/auth/router.js`);

// Models
const Moisture = require('../lib/models/moisture.js');
const moisture = new Moisture();
const Users = require('../lib/models/users.js');
const users = new Users();

const MongoClient = require('mongodb').MongoClient;

// Prepare the express app
const socket = io.connect(process.env.SOCKET);

const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Swagger
const options = require('../docs/config/swagger');
const expressSwagger = require('express-swagger-generator')(app);
expressSwagger(options);

// JSdoc
app.use(express.urlencoded({ extended: true }));
app.use('/docs', express.static('docs'));

app.use(authRouter);

// Routes
app.get('/moisture', getMoisture);
app.get('/moistures', getAllMoisture);
app.get('/user', getUser);
app.post('/user', addUser);
app.put('/user/:id', editUser);
app.delete('/user/:id', deleteUser);

// Catchalls
app.use(notFound);
app.use(errorHandler);

// Route handlers
function getUser(req, res, next) {
  users.get()
    .then(result => {
      res.send(result);
    });
}

function addUser(req, res, next) {
  const payload = req.body;

  users.post(payload)
    .then(result => res.send(result));
}

function editUser(req, res, next) {
  users.put(req.params.id, req.body)
    .then(result => res.send(result));
}

function deleteUser(req, res, next) {
  users.delete(req.params.id)
    .then(result => res.send(result));
}

function getAllMoisture(request, response, next) {
  moisture.get()
    .then(result => {
      const obj = {
        count: result.length,
        data: result,
      };
      response.status(200).json(obj);
    })
    .catch(next);
}

function getMoisture(request, response, next) {
  const query = {
    year: request.body.year,
    month: request.body.month,
    day: request.body.day
  };

  MongoClient.connect('mongodb://localhost:27017/', (err, db) => {
    const dbo = db.db('moisture');
    dbo.collection('moistures').find(query).toArray((err, result) => {
      response.status(200).send(result);
    });
  });
}

let moistureDataArr = [];

const aggregateMoistureData = data => {
  moistureDataArr.push(Number(data.moistureNumber));
};

cron.schedule('* * */1 * * *', () => {
  if (moistureDataArr.length > 0) {
    const length = moistureDataArr.length;
    let total = moistureDataArr.reduce((acc, cur) => {
      acc += cur;

      return acc;
    }, 0);

    total = total / length;
    moistureDataArr = [];

    const totalMoistureData = { moistureNumber: total, timestamp: new Date() };
    moistureSensor(totalMoistureData);
  }
});

function moistureSensor(data) {
  MongoClient.connect('mongodb://localhost:27017/', (err, db) => {
    const dbo = db.db('moisture');
    const query = {
      year: moment().format('YYYY'),
      month: moment().format('MM'),
      day: moment().format('DD')
    };

    dbo.collection('moistures').find(query).toArray((err, result) => {
      if (result.length === 0) {
        moisture.post(query)
          .then(() => {
            dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data } });
          });
      } else {
        dbo.collection('moistures').findOneAndUpdate(query, { $push: { reads: data } });
      }
    });
  });
};

socket.on('moisture-data', aggregateMoistureData);

module.exports = {
  server: app,
  start: port => {
    const PORT = port || 3008;
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  },
};
