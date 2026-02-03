// Export all models from a single entry point
const User = require('./userModel');
const Desk = require('./deskModel');
const File = require('./fileModel');
const Log = require('./logModel');
const Timeline = require('./timelineModel');

module.exports = {
  User,
  Desk,
  File,
  Log,
  Timeline
};
