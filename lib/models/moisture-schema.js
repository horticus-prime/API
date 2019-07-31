'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

/**
*Create a new Moisture Schema
* @name module:Schema#moisture
* @desc Saves a timestamp moisture-category, and moisture-number to the database
*/

// Needs to be modified for new data format
// const moisture = mongoose.Schema({
//   timestamp: {type: String, required: true},
//   moistureCategory: {type: String, required: true},
//   moistureNumber: {type: String, required: true},
// });

const moisture = mongoose.Schema({
  year: {type: String, required: true},
  month: {type: String, required: true},
  day: {type: String, required: true},
  reads: [],
});

/**
*Pre-save function
* @method Pre - Before Saving to Data Base
* @desc Before saving data to the database change the case to Upper Case
*/
moisture.pre('save', function (){
  // This is where we can do the query to see if we need to add data to existing or create new
  console.log('this', this);
});

/**
*Post-save function
* @method Post - After saving to the database
* @desc After saving to the database console log information
*/
moisture.post('save', function(){
  console.log('Finished saving');
  console.log(this);
});

/**
* @module exports Moisture
*/
module.exports = mongoose.model('moisture', moisture);
