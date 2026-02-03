const mongoose = require('mongoose');
const validator = require('validator');

const deskSchema = new mongoose.Schema({
  office: {
    type: String,
  },
  branch: {
    type: String,
  },
  designation: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  userAssigned: {
    type: Boolean,
    default: false
  }
});

const Desk = mongoose.model('Desk', deskSchema);
module.exports = Desk;
