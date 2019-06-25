'use strict';

const mongoose = require('mongoose');

const moisture = mongoose.Schema({
  timeStamp: {type: String, required: true},
  moistureCategory: {type: String, required: true},
  moistureNumber: {type: String, required: true},
});

moisture.pre('save', function (){
  this.moistureCategory = this.moistureCategory.toUpperCase();
});

moisture.post('save', function(){
  console.log('Finished saving');
  console.log(this);
});


module.exports = mongoose.model('moisture', moisture);