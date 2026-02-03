const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { userRoutes, fileRoutes, deskRoutes, viewRoutes } = require('./routes');

const app = express();

// View engine setup (for legacy Pug views)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://23bctg1k-5173.inc1.devtunnels.ms'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/', viewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/desks', deskRoutes);
app.use('/blockchain', require('../blockchain/backend/routes/logs'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

module.exports = app;
