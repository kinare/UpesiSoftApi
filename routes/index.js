var express = require('express');
var router = express.Router();
var moment = require('moment');

router.all('/', function(req, res, next) {
	res.send({
		status: 'success',
		data: {
			name: 'Focus ERP API',
			version: 'v1.0.1',
			owner: 'www.digital4africa.com',
			timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
		}
	})
});

module.exports = router;
