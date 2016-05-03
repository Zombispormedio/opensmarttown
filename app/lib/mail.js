var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

var C = require("../../config/main")
var Log = require(C.lib + "logger")

const Mail = {};

Mail.send = function (options, cb) {
    console.log(process.env.SMART_EMAIL)
    sendgrid.send({
        to: [options.email],
        from: options.dev_email || process.env.SMART_EMAIL,
        subject: options.subject,
        html: options.text,
        toname:[options.toname],
        fromname:options.fromname
    }, function (err, json) {
        if (err) { Log.error("MailError", err); }
        cb();
    });
}


module.exports = Mail;