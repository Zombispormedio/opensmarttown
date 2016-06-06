var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorGridModel = require(C.models + "sensor_grid");
var MagnitudeModel = require(C.models + "magnitude");
var ZoneCtrl = require(C.ctrl + "zone");
var SensorRegistryCtrl = require(C.ctrl + "sensor_registry")

const Controller = {};

Controller.GetZoneStats = $(function (params, cb) {

    async.waterfall([
        Zones(params),
        Stats(params),

        Omit,
        ZoneCtrl.FormatZone(params)

    ], cb);
});


var Zones = function (params) {

    return function (cb) {

        ZoneCtrl.getZoneNotOmitIDNoFormat(params, cb);
    }

}

var Stats = function (params) {

    return function (zones, cb) {

        async.waterfall([
            function Magnitude(next) {
                var p = {}
                if (params.magnitude) {
                    p.ref = params.magnitude;
                }
                MagnitudeModel.findOne(p).select("_id ref display_name").exec(next)
            },

            function Sensors(magnitude, next) {

                SensorModel.aggregate([
                    { $match: { magnitude: magnitude._id } },

                    {
                        $group: {
                            _id: "$sensor_grid",

                            sensors: { $push: "$_id" }
                        }
                    }
                ]).exec(function (err, result) {
                    if (err) return cb(err);
                    var worker = {
                        magnitude: magnitude,
                        grids: result
                    }

                    next(null, worker);
                });

            },
            function Grids(worker, next) {
                if (worker.grids.length === 0) return cb(null, worker);
                var grid_ids = worker.grids.map(function (item) { return item._id });

                SensorGridModel.aggregate([
                    { $match: { _id: { $in: grid_ids } } },
                    {
                        $group: {
                            _id: "$zone",
                            grids: { $push: "$_id" }
                        }
                    }
                ]).exec(function (err, result) {
                    if (err) return cb(err);
                    worker.zones = result;
                    next(null, worker);
                });


            },
            function Zones(worker, next) {
                var zones = worker.zones;
                var grids = worker.grids;


                worker.zones = zones.map(function (zone) {
                    zone.sensors = zone.grids.reduce(function (prev, grid_id) {
                        var g = _.find(grids, function (o) {
                            return o._id.equals(grid_id);
                        });

                        if (g) {
                            prev = prev.concat(g.sensors);
                        }

                        return prev;
                    }, []);



                    return zone;
                });

                next(null, worker);


            },
            function Stats(worker, next) {
                async.map(worker.zones, function (item, n) {
                    var p = {
                        sensors: item.sensors,
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

                        n(null, item);
                    });



                }, function () {
                    next(null, worker);
                });
            }


        ], function (err, worker) {
            if (err) return cb(err);

            var stats_zones = worker.zones;
            var magnitude = worker.magnitude;

            async.map(zones, function (zone, done) {

                var zone_id = zone._id;

                var stats_obj = _.find(stats_zones, function (o) {
                    return o._id.equals(zone_id);
                });

                zone.stats = {
                    magnitude: {
                        ref: magnitude.ref,
                        display_name: magnitude.display_name
                    }

                }

                if (stats_obj) {

                    zone.stats.data = stats_obj.stats;
                } else {
                    zone.stats.data = [];
                }

                done(null, zone);


            }, cb);

        });


    }

}


var Omit = function (zones, cb) {

    async.map(zones, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}


module.exports = Controller;