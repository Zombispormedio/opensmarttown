var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")


var SensorGridModel = require(C.models + "sensor_grid")
var SensorModel = require(C.models + "sensor");
var MagnitudeModel = require(C.models + "magnitude");

var Controller = {};

Controller.GetSensor = function (params, cb) {
    var pipeline = [];
    SensorModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);
    SensorModel.DefaultFormat(pipeline);
    async.waterfall([
        function (next) {
            SensorModel.aggregate(pipeline).exec(next);
        },
        MagnitudeRef,
        GridRef

    ], cb);

}


Controller.Get = $(Controller.GetSensor);



var MagnitudeRef = function (sensors, cb) {
    async.map(sensors, function (item, next) {

        MagnitudeModel.RefAndUnit(item.magnitude, item.unit, function (err, magnitude, unit) {
            if (err) return next(err);

            item.magnitude = magnitude;


            item.unit = unit;
            next(null, item);
        });


    }, cb);
}

var GridRef = function (sensors, cb) {
    async.map(sensors, function (item, next) {

        SensorGridModel.Ref(item.grid, function (err, ref) {
            if (err) return next(err);

            item.grid = ref;
            next(null, item);
        });


    }, cb);
}

Controller.MagnitudeIDs = $(function (ref, cb) {
    MagnitudeModel.findOne({ ref: Number(ref) }, function (err, result) {
        if (err) return cb(err);
        if (!result) return cb(i18n.E.no_magnitude);

        SensorModel.find({ magnitude: result._id }).select("_id").exec(function (err, result) {
            if (err) return cb(err);
            var ids = result.map(function (item) {
                return item._id;
            });

            cb(null, ids);
        });


    });
});

Controller.GridIDs = $(function (ref, cb) {
    SensorGridModel.findOne({ ref: Number(ref) }, function (err, result) {
        if (err) return cb(err);

        cb(null, result.sensors);
    });
});



module.exports = Controller;