var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var verifier = require('email-verify');
var C = require("../../config/main")
var log = require(C.lib + "logger")
const Mail = {};

Mail.send = function (options, cb) {
    sendgrid.send({
        to: [options.email],
        from: options.dev_email || process.env.SMART_EMAIL,
        subject: options.subject,
        html: options.text,
        toname: [options.toname],
        fromname: options.fromname
    }, function (err, json) {
        if (err) { return cb(err); }
        cb();
    });
}


Mail.verify = function (email, cb) {

    verifier.verify(email, function (err, info) {
        if (err) return cb(err);
       log.info(info);
       cb(null, info.success);
    });
}


module.exports = Mail;