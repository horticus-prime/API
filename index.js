'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

const mongooseOptions = {
  useNewUrlParser:true,
  useCreateIndex:true,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
console.log(process.env.MONGODB_URI);
console.log(process.env.PORT);

const app = require('./src/app.js');

app.start(process.env.PORT);