var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")


var SensorRegistryModel = require(C.models + "sensor_registry")


const Controller = {};


Controller.GetSensorStats = function (params, cb) {
    var pipeline = [];

    if (params) {
        var match = {};
        if (params.sensors) {
            if (params.sensors.length > 0) {
                match.node_id = { $in: params.sensors };
            }
        }


        if (Object.keys(match) > 0) {
            pipeline.push({ $match: match });
        }
    }

    var group = {
        $group: {
            _id: "$node_id",
            avg_value: { $avg: "$value" },
            max_value: { $max: "$value" },
            min_value: { $min: "$value" }
        }
    }
    pipeline.push(group);


    SensorRegistryModel.aggregate(pipeline).exec(cb);
}



module.exports = Controller;