const mongoose = require('mongoose');
const validator = require('validator');

const logSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.ObjectId,
    ref: 'File'
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  time: {
    type: Date,
    validate: [validator.isDate, 'Enter a valid date']
  }
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
