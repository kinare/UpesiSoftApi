var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

router.all('/', function(req, res, next) {
	res.send({
		status: 'success',
		data: {
			name: 'Focus ERP API',
			version: 'v1.0.1',
			owner: 'www.digital4africa.com',
			// password: bcrypt.hashSync('karibu', 10),
			// time: 
		}
	})
});

module.exports = router;
