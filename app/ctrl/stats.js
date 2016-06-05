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

Controller.GetStatsSensor = $(function (params, cb) {

    async.waterfall([
        Sensors(params),
        StatsSensor(params),
        Omit

    ], cb);
});

var Sensors = function (params) {

    return function (cb) {

        SensorCtrl.GetSensorNotOmitID(params, cb);
    }

}

var StatsSensor = function (params) {
    return function (sensors, cb) {
        if (sensors.length == 0) return cb(null, cb);
        var p = {
            sensors: sensors.map(function (a) {
                return a._id;
            }),

            type: params.type || "year",
            from: params.from,
            to: params.to,
        }

        SensorRegistryCtrl.GetStats(p, function (err, result) {
            if (err) return cb(err);

            sensors.forEach(function (item) {
                var r = _.find(result, function (z) {
                    return z._id.equals(item._id);
                });

                if (r) {
                    item.stats = _.omit(r, ["_id"]).stats;

                } else {
                    item.stats = [];
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