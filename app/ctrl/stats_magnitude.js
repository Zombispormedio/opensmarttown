var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");

var MagnitudeCtrl = require(C.ctrl + "magnitude");

var SensorRegistryCtrl = require(C.ctrl + "sensor_registry")

const Controller = {};

Controller.GetMagnitudeStats = $(function (params, cb) {

    async.waterfall([
        Magnitudes(params),
        Stats(params),

        Omit,
        

    ], cb);
});


var Magnitudes = function (params) {

    return function (cb) {

        MagnitudeCtrl.GetWithID (params, cb);
    }

}

var Stats = function (params) {

    return function (magnitudes, cb) {
        if(magnitudes.length===0)return cb(null, []);
        
        async.map(magnitudes, function(item, done){
            
          
            SensorModel.aggregate([
                {$match:{magnitude:item._id}},
                {$group:{
                    _id:"$magnitude",
                    sensors:{$push:"$_id"}
                }}
            ]).exec(function(err, result){
                if(err)return done(err);
               
                if(result.length>0){
                    
                     var p = {
                        sensors: result[0].sensors,
                        type: params.type || "year",
                        from: params.from,
                        to: params.to,
                        no_id: true
                    };
                    SensorRegistryCtrl.GetStats(p, function (err, r) {
                        if (r.length > 0) {
                            item.stats = r[0].stats;
                        } else {
                            item.stats = [];
                        }

                        done(null, item);
                    });

                    
                }else{
                    item.stats=[];
                    done(null, item);
                }

            });

            
        }, cb);
      
    }

}


var Omit = function (zones, cb) {
   
    async.map(zones, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}


module.exports = Controller;