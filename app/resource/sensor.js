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

            pre._id = 0;
            pre.display_name = 1;
            pre.device_name = 1;
            pre.ref = 1
            pre.description = 1;

            pre.magnitude = 1;
            pre.unit = 1;
            pre.grid = "$sensor_grid";

            if (params.no_last_sync!=="true")
                pre.last_sync = 1;

            var project = { $project: pre };

            pipeline.push(project);

        },
        match: function (pipeline, params) {
            var q = {};

            if (params.ref) {
                q.ref = Number(params.ref);
            } else {
                var set = Immutable.Set();
                 var grid_set=Immutable.Set();

                if (utils.isNotEmpty(params.magnitudeIDs)) {
                    var magnitude = params.magnitudeIDs;
                    set = set.concat(magnitude);
                }

                if (utils.isNotEmpty(params.SensorIDsByGrid)) {
                    var sensor_bygrid = params.SensorIDsByGrid;
                    set = set.concat(sensor_bygrid);
                }


                if (set.count() > 0) {
                    q._id = { $in: set.toArray() };
                }
                
                if(utils.isNotEmpty(params.nearGridIDs)){
                   var nearGrids=params.nearGridIDs;
                   grid_set=grid_set.concat(nearGrids);
                }
               
                
                 if (grid_set.count() > 0) {
                    q.sensor_grid = { $in: grid_set.toArray() };
                }

            }
        

            pipeline.push({ $match: q });
        }

    }

}