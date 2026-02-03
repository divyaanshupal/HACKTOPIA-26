const mongoose = require('mongoose');
const validator = require('validator');

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
  },
  subject: {
    type: String,
  },
  dateOfLastForward: {
    type: Date,
    validate: [validator.isDate, 'Enter a valid date']
  },
  currentDesk: {
    type: mongoose.Schema.ObjectId,
    ref: 'Desk'
  },
  currentBranch: {
    type: String
  },
  currentOffice: {
    type: String,
  },
  currentUserId: {
    type: String
  },
  currentUserName: {
    type: String
  },
  createdBy: {
    type: String  // Tracks the original creator of the file
  },
  previousDesk: {
    type: mongoose.Schema.ObjectId,
    ref: 'Desk'
  },
  timeline: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Timeline'
  }],
  mode: {
    type: String,
    enum: {
      values: ['Physical', 'Digital'],
      message: 'Enter a valid Mode (Digital or Physical)'
    }
  },
  creationDate: {
    type: Date,
    validate: [validator.isDate, 'Enter a valid creation date']
  },
  expectedDate: {
    type: Date,
    validate: [validator.isDate, 'Enter a valid expected date']
  },
  delayed: {
    type: Boolean
  },
  timeTakenInDays: {
    type: Number
  },
  applicantDetails: {
    name: String,
    mobileNumber: Number,
    email: {
      type: String,
      validate: [validator.isEmail, 'Enter a valid Email Id']
    }
  },
  applicantMobileNumber: {
    type: Number
  },
  file: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Closed'],
    default: 'Pending'
  },
  summary: {
    type: String
  },
  priority: {
    type: String,
    enum: ['HIGH_PRIORITY', 'NORMAL', 'LOW_PRIORITY', null],
    default: null
  }
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
