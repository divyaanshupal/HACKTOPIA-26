const mongoose = require('mongoose');
const validator = require('validator');

const timelineSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: [true, 'Enter file ID:']
  },
  status: {
    type: String,
    enum: {
      values: ['Approved', 'Rejected','Pending'],
      message: 'Enter valid Status (Approved or Rejected)',
    }
  },
  dateOfReceiving: {
    type: Date,
    validate: [validator.isDate, 'Please type correct date']
  },
  dateOfForwarding: {
    type: Date,
    validate: [validator.isDate, 'Please type correct date']
  },
  remarks: {
    type: String,
  },
  desk: {
    type: mongoose.Schema.ObjectId,
    ref: 'Desk'
  }
});

const Timeline = mongoose.model('Timeline', timelineSchema);
module.exports = Timeline;
