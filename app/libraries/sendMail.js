var nodemailer = require('nodemailer');

exports.send = function(mailOptions = null, callback) {
    var transporter = nodemailer.createTransport({
        host: "host61.registrar-servers.com",
        port: 465,
        secure: true,
        auth: {
            user: 'orders@doorstep.co.ke',
            pass: 'doorstep254'
        }
    });

    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log(error);
            callback({error: error})

        } else {
            console.log('Email sent: ' + info.response);
            callback(info)
        }
    });
}