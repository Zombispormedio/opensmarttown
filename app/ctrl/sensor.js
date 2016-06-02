var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")


var SensorGridModel = require(C.models + "sensor_grid")
var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var SensorRegistryCtrl = require(C.ctrl + "sensor_registry")

var SensorModel = require(C.models + "sensor");
var MagnitudeModel = require(C.models + "magnitude");

var Controller = {};

Controller.GetSensor = function (params, cb) {
    var pipeline = [];
    SensorModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);
    SensorModel.DefaultFormat(pipeline, params);

    var exec_pipeline = [
        function (next) {
            SensorModel.aggregate(pipeline).exec(next);
        }
    ];

    exec_pipeline.push(Magnitude(params));

    exec_pipeline.push(Grid(params));

    if (params.stats === "true") {
         exec_pipeline.push(Stats);
    }

    exec_pipeline.push(Omit);

    async.waterfall(exec_pipeline, cb);

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
                    id: item.grid,
                    onlyRefs: params.onlyRefs,
                    no_sensors: "true",
                    no_shape: params.no_shape
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

var Omit = function (sensors, cb) {

    async.map(sensors, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}

var Stats=function (sensors, cb) {

     var params = {
        sensors: sensors.map(function (a) {
            return a._id;
        })
    }
    
    SensorRegistryCtrl.GetSensorStats(params, function(err, result){
        result.forEach(function (item) {
            var sensor=_.find(sensors, function(z){
               return z._id.equals(item._id); 
            });
            
            if(sensor){
                sensor.stats=_.omit(item, ["_id"]);
             
            }
        });
        
        cb(null,sensors);
    });

}



module.exports = Controller;