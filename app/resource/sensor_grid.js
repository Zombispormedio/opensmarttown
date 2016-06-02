const SIZE = process.env.OPEN_API_PAGINATION;
var Immutable = require('immutable');

var C = require("../../config/main");
var utils = require(C.lib + "utils");
const GEO_UNIT = Number(process.env.GEO_UNIT);
const MAX_DISTANCE = Number(process.env.OPEN_API_MAX_DISTANCE);

module.exports = function (Schema) {

    Schema.statics = {

        DefaultFormat: function (pipeline, params) {
            var pre = {};

            pre._id = 0;
            pre.display_name = 1;
            pre.device_name = 1;
            pre.ref = 1
            pre.description = 1;
            pre.location = 1

            if (params.no_sensors !== "true")
                pre.sensors = 1;

            pre.zone = 1;

            var project = { $project: pre };

            pipeline.push(project);

        },
        match: function (pipeline, params) {
            var q = {};

            if (params.ref) {
                q.ref = Number(params.ref);
            } else {
                var set = Immutable.Set();

                if (utils.isNotEmpty(params.nearIDs)) {
                    var near = params.nearIDs;
                    set = set.concat(near);
                }

                if (set.count() > 0) {
                    q._id = { $in: set.toArray() };
                }


                if (params.greater_num_sensor) {
                    var greater = params.greater_num_sensor;
                    q["sensors." + (greater - 1)] = { $exists: true };

                }

                if (params.less_num_sensor) {
                    var less = params.less_num_sensor;
                    q["sensors." + less] = { $exists: false };
                }





            }

            pipeline.push({ $match: q });
        },
        near: function (coords, max) {
            var _max = (max || MAX_DISTANCE) / GEO_UNIT;
            return { $near: coords, $maxDistance: _max }
        },
        Ref: function (id, cb) {
            this.findOne({ _id: id }).select("ref").exec(function (err, result) {
                if (err) return cb(err);

                cb(null, result.ref);
            });
        },
        GetCountsByZone: function (params, cb) {
            var pipeline = [];
            if (params) {
                var match = {};
                if (params.zones) {
                    if (params.zones.length > 0) {
                        match.zone = { $in: params.zones };
                    }
                }

                if (Object.keys(match) > 0) {
                    pipeline.push({ $match: match });
                }
            }

            var group = {
                $group: {
                    _id: "$zone",
                    num_sensors: { $sum: { $size: "$sensors" } },
                    grids: { $push: "$$ROOT" }
                }
            };
            pipeline.push(group);

            var project = {
                $project: {
                    num_sensors: 1,
                    num_grids: { $size: "$grids" }
                }
            };
            pipeline.push(project);

            this.aggregate(pipeline).exec(cb);

        }

    }

}