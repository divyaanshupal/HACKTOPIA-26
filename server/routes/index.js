// Export all routes from a single entry point
const userRoutes = require('./userRoutes');
const fileRoutes = require('./fileRoutes');
const deskRoutes = require('./deskRoutes');
const viewRoutes = require('./viewRoutes');

module.exports = {
  userRoutes,
  fileRoutes,
  deskRoutes,
  viewRoutes
};
