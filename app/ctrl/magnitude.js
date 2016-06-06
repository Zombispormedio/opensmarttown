var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")

var SensorGridModel = require(C.models + "sensor_grid");
var SensorModel = require(C.models + "sensor");
var MagnitudeModel = require(C.models + "magnitude");

const Controller = {};


var GetMagnitude = function (params, cb) {
    var pipeline = [];

    MagnitudeModel.match(pipeline, params);

    MagnitudeModel.format(pipeline, params);

    mongo.paginateAggregation(pipeline, params.page, params.size);


    var q = MagnitudeModel.aggregate(pipeline)

    async.waterfall([
        function (next) {
            q.exec(next);
        },
        function (result, next) {
            var magnitudes = formatConversion(result);
            next(null, magnitudes);
        },
        SensorsCount,

        Omit
    ], cb);


}

Controller.Get = $(GetMagnitude);


Controller.GetWithID = function (params, cb) {
    var pipeline = [];

    MagnitudeModel.match(pipeline, params);

    MagnitudeModel.format(pipeline, params);

    mongo.paginateAggregation(pipeline, params.page, params.size);


    var q = MagnitudeModel.aggregate(pipeline)

    q.exec(function (err, result) {
        if (err) return cb(err);

        var magnitudes = formatConversion(result);


        cb(null, magnitudes);

    });


}

var formatConversion = function (result) {
    return result.map(function (item) {
        var magnitude = _.omit(item, ["conversions", "analog_units"]);

        if (magnitude.type === i18n.C.ANALOG) {
            var analog = item.analog_units;

            magnitude.conversions = item.conversions.reduce(function (prev, c) {
                var unitA = _.find(analog, function (a) {
                    return a._id.equals(c.unitA);
                });

                var unitB = _.find(analog, function (a) {
                    return a._id.equals(c.unitB);
                });


                if (unitA != void 0 && unitB != void 0) {
                    var conversion = _.omit(c, ["_id", "unitA", "unitB"]);

                    conversion.unitA = unitA.display_name;

                    conversion.unitB = unitB.display_name;
                    prev.push(conversion);
                }


                return prev;
            }, []);

        }

        return magnitude;

    });
}


var Omit = function (magnitudes, cb) {

    async.map(magnitudes, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}

var SensorsCount = function (magnitudes, cb) {
    async.map(magnitudes, function (item, next) {

        var magnitude_id = item._id;

        SensorModel.aggregate([
            { $match: { magnitude: magnitude_id } },
            {
                $group: {
                    "_id": "$magnitude",
                    sensors: { $push: "$_id" }
                }
            }
        ]).exec(function (err, s_result) {
            if (err) return next(err);
            if (s_result.length === 0) {
                item.num_sensors = 0;
                item.num_grids = 0;
                return next(null, item);
            }

            var result = s_result[0];
            item.num_sensors = result.sensors.length;

            SensorGridModel.count({ sensors: { $in: result.sensors } }).exec(function (err, g_count) {
                if (err) return next(err);

                item.num_grids = g_count;
                next(null, item);

            });



        });



    }, cb);
}


module.exports = Controller;