var C = require("../../config/main")
var Immutable = require('immutable');


var utils = require(C.lib + "utils");
module.exports = function (Schema) {

    Schema.statics = {

        GetRefs: function (ids, cb) {
            this.find({ _id: { $in: ids } }).select("ref").exec(function (err, refs) {
                if (err) return cb(err);

                var refs = refs.map(function (a) {
                    return a.ref;
                });
                cb(null, refs);
            });
        },
        DefaultFormat: function (pipeline, params) {
            var pre = {};


            pre.display_name = 1;
            pre.device_name = 1;
            pre.ref = 1
            pre.description = 1;

            pre.magnitude = 1;
            pre.unit = 1;
            pre.grid = "$sensor_grid";

            if (params.no_last_sync !== "true")
                pre.last_sync = 1;

            var project = { $project: pre };

            pipeline.push(project);

        },
        match: function (params) {
            var q = {};

            if (params.ref) {
                q.ref = Number(params.ref);
            } else {


                var set = Immutable.Set();
                var grid_set = Immutable.Set();
                var flag_sensor = false;
                var flag_grid = false;


                if (utils.isNotEmptyAndNull(params.magnitudeIDs)) {
                    var magnitude = params.magnitudeIDs;
                    set = set.concat(magnitude);
                    flag_sensor = true;
                }


                if (utils.isNotEmptyAndNull(params.SensorIDsByGrid)) {
                    var sensor_bygrid = params.SensorIDsByGrid;


                    if (set.count() > 0) {
                        set = set.intersect(sensor_bygrid);
                    } else {
                        set = set.concat(sensor_bygrid);
                    }

                    flag_sensor = true;
                }

                if (utils.isNotEmptyAndNull(params.SensorIDsByZone)) {
                    var sensor_byzone = params.SensorIDsByZone;


                    if (set.count() > 0) {
                        set = set.intersect(sensor_byzone);
                    } else {
                        set = set.concat(sensor_byzone);
                    }
                    flag_sensor = true;
                }


                if (utils.isNotEmptyAndNull(params.nearGridIDs)) {
                    var nearGrids = params.nearGridIDs;
                    grid_set = grid_set.concat(nearGrids);
                    flag_grid = true;
                }






                if (set.count() > 0) {
                    q._id = { $in: set.toArray() };
                } else {
                    if (flag_sensor)
                        return null;
                }


                if (grid_set.count() > 0) {
                    q.sensor_grid = { $in: grid_set.toArray() };
                } else {
                    if (flag_grid)
                        return null;
                }


            }


            return { $match: q };
        }

    }

}