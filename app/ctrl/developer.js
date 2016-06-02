var Boom = require("boom");
var _ = require("lodash");
var $ = require('thunkify');
var sprintf = require("sprintf-js").sprintf;
var async=require("async");
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mail = require(C.lib + "mail")
var DeveloperModel = require(C.models + "developer")

const Controller = {};

Controller.signin = $(function (body, cb) {
    var email = body.email;
    if (_.isEmpty(email)){
        
        return cb(Boom.badData(i18n.E.no_email));
    } 

    async.waterfall([
        
        function(next){
           mail.verify(email, function(err, exists){
               if(err)return next(err);
               if(!exists)return next(i18n.E.email_not_exists);
               next();
           } ); 
        }, 
        function (next) {
            DeveloperModel.UpdateAccessToken(email, next);
        },
        function (flags, next) {
        
            if (flags.update){
                var obj=Object.create(null);
                obj.response=i18n.M.res_update_token,
                obj.message= i18n.M.msg_update_token,
                obj.access_token= flags.access_token
            
                return next(null, obj)
            } 
           

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
            }, function (err) {
                if(err)return next(err);
                next(null, result.response);
            });
        }


    ], cb);



});


Controller.checkApiKey=$(function(api_key, cb){
    DeveloperModel.findOne({"access_token":api_key}, function(err, result){
       if(err)return cb(err);
       if(!result)return cb(Boom.badData(i18n.E.api_key_not_valid));
       cb(null, true)
    });
});

module.exports = Controller;