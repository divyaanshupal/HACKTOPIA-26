const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: {
      values: ['Admin', 'DEPT_HEAD', 'OP_HEAD', 'GENERAL']
    }
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please enter valid email address'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  },
  currentDesk: {
    type: mongoose.Schema.ObjectId,
    ref: 'Desk'
  },
  onDesk: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
