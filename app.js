var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users')
var productsRouter = require('./routes/products')
var customersRouter = require('./routes/customers')
var ordersRouter = require('./routes/orders')

var cors = require('cors');
var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', productsRouter);
app.use('/', customersRouter);
app.use('/', ordersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send({
		status: 'error',
		message: err.message ? err.message : 'There was an error handling your request. Please contact an admin if the issue persists.',
		errorCode: err.status ? err.status : 500,
		requestDetails: req.body
	});
});

module.exports = app;
