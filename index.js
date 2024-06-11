const express = require('express');
const engine = require('ejs-locals');
const path = require('path');
const app = express();
const indexRouter = require('./routes/index');

// critical todo: to ensure in PRODUCTION you don't disable TLS cert verification
var env = process.env.NODE_ENV || 'development';
if (env === 'development')
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);


// Start the server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
