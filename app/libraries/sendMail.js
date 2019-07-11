var nodemailer = require('nodemailer');

exports.send = function(mailOptions = null, callback) {
    var transporter = nodemailer.createTransport({
        host: "cp-1.webhostbox.net",
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@upesisoft.com',
            pass: '~cwMXChV~$Ig'
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