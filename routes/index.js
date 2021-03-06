var express = require('express');
var router = express.Router();
var moment = require('moment');

router.all('/', function(req, res) {
	res.send({
		status: 'success',
		data: {
			name: 'Focus ERP API',
			version: 'v1.0.2',
			owner: 'www.digital4africa.com',
			timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
		}
	})
});

module.exports = router;
