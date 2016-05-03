var Boom = require("boom");
var _ = require("lodash");
var $ = require('thunkify');
var sprintf = require("sprintf-js").sprintf;
var async=require("async");

var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mail = require(C.lib + "mail")
var DeveloperModel = require(C.models + "developer")

var Controller = {};

Controller.signin = $(function (body, cb) {
    var email = body.email;
    if (_.isEmpty(email)) return cb(Boom.badData(i18n.E.no_email));

    async.waterfall([
        function (next) {
           
            DeveloperModel.UpdateAccessToken(email, function(err, flags){
                console.log(err, flags);
                next(null, flags);
            });
        },
        function (flags, next) {
            console.log(flags);
            if (flags.update) return next(null, {
                response: i18n.M.res_update_token,
                message: i18n.M.msg_update_token,
                access_token: flags.access_token
            })
            

            var user = new DeveloperModel({ email: email });
            user.generateAccessToken();

            user.save(function (err, result) {
                if (err) return cb(err);

                next(null, {
                    response: i18n.M.res_create_token,
                    message: i18n.M.msg_create_token,
                    access_token: result.access_token
                });
            })
        },
        function (result, next) {
            mail.send({
                email: email,
                text: sprintf(result.message, result.access_token),
                subject: i18n.M.msg_subject,
                toname: i18n.M.toname,
                fromname: i18n.M.fromname
            }, function () {
                
                next(null, result.response);
            });
        }


    ], cb);



});

module.exports = Controller;