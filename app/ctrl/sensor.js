var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")


var SensorGridModel = require(C.models + "sensor_grid")
var SensorGridCtrl = require(C.ctrl + "sensor_grid")

var SensorModel = require(C.models + "sensor");
var MagnitudeModel = require(C.models + "magnitude");

var Controller = {};

Controller.GetSensor = function (params, cb) {
    var pipeline = [];
    SensorModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);
    SensorModel.DefaultFormat(pipeline, params);
    async.waterfall([
        function (next) {
            SensorModel.aggregate(pipeline).exec(next);
        },
        Magnitude(params),
        Grid(params)

    ], cb);

}


Controller.Get = $(Controller.GetSensor);



var Magnitude = function (params) {
    return function (sensors, cb) {
        var only = params.onlyRefs;
        async.map(sensors, function (item, next) {
            var conf = { magnitude: item.magnitude, unit: item.unit, onlyRefs: only };
            MagnitudeModel.ThisAndUnit(conf, function (err, magnitude, unit) {
                if (err) return next(err);

                item.magnitude = magnitude;


                item.unit = unit;
                next(null, item);
            });


        }, cb);
    }
}



var Grid = function (params) {
    return function (sensors, cb) {
        async.map(sensors, function (item, next) {
            if (params.onlyRefs === "false") {
                var p = {
                    id:item.grid,
                    onlyRefs: params.onlyRefs,
                    no_sensors: "true",
                    no_shape:params.no_shape
                }

                SensorGridCtrl.ByID(p, function (err, grids) {
                    if (err) return next(err);

                    item.grid = grids[0];
                    next(null, item);
                });
            } else {

                SensorGridModel.Ref(item.grid, function (err, ref) {
                    if (err) return next(err);
                    item.grid = ref;
                    next(null, item);
                });
            }


        }, cb);
    }
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

Controller.SensorIDsByGrid = $(function (ref, cb) {
    SensorGridModel.findOne({ ref: Number(ref) }, function (err, result) {
        if (err) return cb(err);

        cb(null, result.sensors);
    });
});



module.exports = Controller;