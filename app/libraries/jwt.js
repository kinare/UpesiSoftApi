const fs = require('fs');
const jwt = require('jsonwebtoken');

// use 'utf8' to get string instead of byte array  (512 bit key)
// let privateKEY = fs.readFileSync('private.key', 'utf8');
// let publicKEY = fs.readFileSync('public.key', 'utf8');
let key = 'SFS234JKSP94RKS024NA052HOPQWR24'

module.exports = {
    sign: (payload, options, callback) => {
        /*
         options = {
          issuer: "Authorizaxtion/Resource/This server",
          subject: "iam@user.me", 
          audience: "Client_Identity" // this should be provided by client
         }
        */

        // Token signing options
        var signOptions = {
            issuer: options.issuer,
            subject: options.subject,
            audience: options.audience,
            expiresIn: "14d", // 30 days validity
            // algorithm: "RS256"
        };

        callback(jwt.sign(payload, key, signOptions));
    },

    verify: (token, options, callback) => {
        /*
         vOption = {
          issuer: "Authorization/Resource/This server",
          subject: "iam@user.me", 
          audience: "Client_Identity" // this should be provided by client
         }  
        */
        var verifyOptions = {
            issuer: options.issuer,
            subject: options.subject,
            audience: options.audience,
            expiresIn: "30d",
            algorithm: ["RS256"]
        };

        try {
            callback(jwt.verify(token, key, verifyOptions));
        } catch (err) {
            callback(false);
        }
    },

    decode: (token, callback) => {
        callback(jwt.decode(token, {
            complete: true
        }));
        //returns null if token is invalid
    }
}
