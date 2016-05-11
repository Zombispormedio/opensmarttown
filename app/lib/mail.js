var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

var C = require("../../config/main")

const Mail = {};

Mail.send = function (options, cb) {
    sendgrid.send({
        to: [options.email],
        from: options.dev_email || process.env.SMART_EMAIL,
        subject: options.subject,
        html: options.text,
        toname:[options.toname],
        fromname:options.fromname
    }, function (err, json) {
        if (err) { return cb(err); }
        cb();
    });
}


module.exports = Mail;