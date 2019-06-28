'use strict';

const mongoose = require('mongoose');

/**
*Create a new Moisture Schema
* @name module:Schema#moisture
* @desc Saves a timestamp moisture-category, and moisture-number to the database
*/

const moisture = mongoose.Schema({
  timestamp: {type: String, required: true},
  moistureCategory: {type: String, required: true},
  moistureNumber: {type: String, required: true},
});

/**
*Pre-save function
* @method Pre - Before Saving to Data Base
* @desc Before saving data to the database change the case to Upper Case
*/
moisture.pre('save', function (){
  this.moistureCategory = this.moistureCategory.toUpperCase();
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