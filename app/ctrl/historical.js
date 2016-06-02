var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorCtrl = require(C.ctrl + "sensor");
var SensorRegistryCtrl = require(C.ctrl + "sensor_registry")

const Controller = {};

Controller.GetHistorical = $(function (params, cb) {

    async.waterfall([
        Sensors(params),
        History(params),
        Omit

    ], cb);
});

var Sensors = function (params) {

    return function (cb) {

        SensorCtrl.GetSensorNotOmitID(params, cb);
    }

}

var History = function (params) {
    return function (sensors, cb) {
        if (sensors.length == 0) return cb(null, cb);
        var p = {
            sensors: sensors.map(function (a) {
                return a._id;
            }),
            page:params.h_page,
            from:params.from,
            to:params.to,
            size:(params.h_size||30)*sensors.length
        }

        SensorRegistryCtrl.GetHistory(p, function (err, result) {
            if (err) return cb(err);
            result.forEach(function (item) {
                var sensor = _.find(sensors, function (z) {
                    return z._id.equals(item._id);
                });

                if (sensor) {
                    sensor.history = _.omit(item, ["_id"]).history;

                }
            });

            cb(null, sensors);
        });
    }
};



var Omit = function (sensors, cb) {

    async.map(sensors, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}


module.exports = Controller;