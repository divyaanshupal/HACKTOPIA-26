// Export all controllers from a single entry point
const userController = require('./userController');
const deskController = require('./deskController');
const fileController = require('./fileController');
const viewController = require('./viewController');

module.exports = {
  userController,
  deskController,
  fileController,
  viewController
};
