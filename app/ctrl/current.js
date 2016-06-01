var Boom = require("boom");
var async = require("async");
var unirest = require("unirest");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorCtrl = require(C.ctrl + "sensor")

var Controller = {};

Controller.GetSensorData = $(function (params, cb) {

    async.waterfall([
        Format(params),
        CurrentDataSensors
    ], cb);
});


var CurrentDataSensors = function (sensors, cb) {
    async.map(sensors, function (item, next) {
        SensorModel.findOne({ ref: item.ref }).select("node_id").exec(function (err, result) {
            if (err) return next(err);
            if (!result) return next(Boom.expectationFailed(i18n.E.no_sensor));
            var node_id=result.node_id;
      
            CurrentData(node_id, function(err, c){
              if(err)return next(err);
              
             item.current={
                 value:c.value,
                 timestamp:c.timestamp
                };
             next(void 0, item);
                
            });
        });

    }, cb);
}



const PUSH_HOST = process.env.PUSH_HOST;
const SECRET = process.env.OPEN_API_SECRET;

var CurrentData = function (node_id, cb) {
    unirest.get(PUSH_HOST + "realtime/" + node_id)
        .headers("Authorization", SECRET)
        .end(function (res) {
            if (!res.body) return cb(Boom.expectationFailed(i18n.E.no_data));
            if (!res.body.data) return cb(Boom.expectationFailed(i18n.E.no_data));
            cb(void 0, res.body.data);
        })
}


var Format = function (params) {

    return function (cb) {
        params.no_last_sync = "true";
        SensorCtrl.GetSensor(params, cb);
    }

}

module.exports = Controller;