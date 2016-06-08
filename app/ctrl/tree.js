var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorGridModel = require(C.models + "sensor_grid");
var SensorRegistryModel = require(C.models + "sensor_registry")
var ZoneModel = require(C.models + "zone");

const Controller = {};

Controller.Get = $(function (cb) {
    var worker = {};
    async.waterfall([
        Zones(worker),
        Grids,
        Sensors,
        SensorRegistry,
        GridRegistry,
        Compact
    ], cb);
});

var Zones = function (worker) {
    return function (cb) {

        ZoneModel.find({}).select("_id display_name").exec(function (err, zones) {
            if (err) return cb(err);
            worker.zones = zones;
            cb(null, worker);
        });

    }
}

var Grids = function (worker, cb) {
    SensorGridModel.aggregate([
        {
            $group: {
                _id: "$zone",
                grids: {
                    $push: {
                        _id: "$_id",
                        display_name: "$display_name"
                    }
                }
            }
        }
    ]).exec(function (err, result) {
        if (err) return cb(err);

        worker.grids_by_zone = result;
        cb(null, worker);
    });
}

var Sensors = function (worker, cb) {
    SensorModel.aggregate([
        {
            $group: {
                _id: "$sensor_grid",
                sensors: {
                    $push: {
                        _id: "$_id",
                        display_name: "$display_name"
                    }
                }
            }
        }
    ]).exec(function (err, result) {
        if (err) return cb(err);

        worker.sensors_by_grid = result;
        cb(null, worker);
    });
}

var SensorRegistry = function (worker, cb) {
    SensorRegistryModel.aggregate([
        {
            $group: {
                _id: "$node_id",
                count: {
                    $sum: 1
                }
            }
        }
    ]).exec(function (err, result) {
        if (err) return cb(err);

        worker.sensor_registry = result;
        cb(null, worker);
    });
}



var GridRegistry = function (worker, cb) {
    SensorRegistryModel.aggregate([
        {
            $group: {
                _id: "$sensor_grid",
                count: {
                    $sum: 1
                }
            }
        }
    ]).exec(function (err, result) {
        if (err) return cb(err);

        worker.grid_registry = result;
        cb(null, worker);
    });
}


var Compact = function (worker, cb) {

    var grids = worker.grids_by_zone;
    var sensors = worker.sensors_by_grid;
    var sensor_registry = worker.sensor_registry;
    var grid_registry = worker.grid_registry;

    async.map(worker.zones, function (zone, done) {

        var new_item = {
            type: "Zone",
            display_name: zone.display_name
        };
        var zone_id = zone._id;

        var g = _.find(grids, function (o) {
            return o._id.equals(zone_id);
        });

        if (!g) {
            new_item.grids = [];
            return done(null, new_item);
        }

        new_item.grids = g.grids.map(function (item) {
            var grid_id = item._id;
            var obj = {
                display_name: item.display_name
            }
            var g_r = _.find(grid_registry, function (o) {
                return o._id.equals(grid_id);
            });


            obj.count_registry = g_r ? g_r.count : 0;


            var s = _.find(sensors, function (o) {
                return o._id.equals(grid_id);
            });
            if (s) {
                obj.sensors = s.sensors.map(function (a) {

                    var obj = {
                        display_name: a.display_name
                    }
                    var s_r = _.find(sensor_registry, function (o) {
                        return o._id.equals(a._id);
                    });
                    obj.count_registry = s_r ? s_r.count : 0;
                    return obj;

                });



            } else {
                obj.sensors = [];
            }



            return obj;
        });
        done(null, new_item);



    }, cb);
}



module.exports = Controller;