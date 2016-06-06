const SIZE = process.env.OPEN_API_PAGINATION;
const GEO_UNIT = Number(process.env.GEO_UNIT);
const MAX_DISTANCE = Number(process.env.OPEN_API_MAX_DISTANCE);
var Immutable = require('immutable');

var C = require("../../config/main");
var utils = require(C.lib + "utils");


module.exports = function (Schema) {

    Schema.statics = {

        DefaultFormat: function (params) {
            var pre = {};

           
            pre.display_name = 1;
            pre.keywords = 1
            pre.ref = 1
            pre.description = 1;
            pre.lookAt = "$center";
            pre.dist = 1;

            if (params.no_shape !== "true")
                pre.shape = {
                    $cond: {
                        if: { $eq: ["$shape.type", "rectangle"] }, then: { type: "$shape.type", bounds: "$shape.bounds" }, else: {
                            $cond: {
                                if: { $eq: ["$shape.type", "polygon"] }, then: { type: "$shape.type", paths: "$shape.paths" }, else: {
                                    type: "$shape.type", center: "$shape.center", radius: "$shape.radius"
                                }
                            }
                        }
                    }
                }


            var project = { $project: pre };

            return project;

        },
        GeoJSONFormat: function () {
            var pre = {};

            pre.type = { $literal: 'Feature' };
            pre._id = 0;
            pre.geometry = {
                $cond: {
                    if: { $eq: ["$shape.type", "rectangle"] },
                    then: { type: { $literal: "Polygon" }, coordinates: "$shape.bounds" },
                    else: {
                        $cond: {
                            if: { $eq: ["$shape.type", "polygon"] },
                            then: { type: { $literal: "Polygon" }, coordinates: "$shape.paths" },
                            else: {
                                type: { $literal: "Point" }, coordinates: "$shape.center"
                            }
                        }
                    }
                }
            }

            pre.properties = {
                shape: {
                    $cond: {
                        if: { $eq: ["$shape.type", "circle"] },
                        then: { type: "$shape.type", radius: "$shape.radius" },
                        else: {
                            type: "$shape.type"
                        }
                    }
                },
                display_name: "$display_name",
                keywords: "$keywords",
                ref: "$ref",
                description: "$description",

                global_center: { type: { $literal: "Point" }, coordinates: "$center" }
            }

            var project = { $project: pre };

            return project;

        },

        near: function (coords, max) {
            var _max = (max || MAX_DISTANCE) / GEO_UNIT;
            return { $near: coords, $maxDistance: _max }
        },

        match: function (params) {
            var q = {};

            if (params.ref) {
                q.ref = Number(params.ref);
            } else {
                var set = Immutable.Set();
                var flag_param=false;
                
                if (utils.isNotEmptyAndNull(params.nearIDs)) {
                    var near = params.nearIDs;
                    set = set.concat(near);
                    flag_param=true;
                }
                
                if (utils.isNotEmptyAndNull(params.magnitudeIDs)) {
                    var magnitude = params.magnitudeIDs;
                    if(set.count()>0){
                          set = set.intersect(magnitude);
                    }else{
                          set = set.concat(magnitude);
                    }
                   
                    flag_param=true;
                }
               

                if (set.count() > 0) {
                    q._id = { $in: set.toArray() };
                }else{
                    if(flag_param){
                        return null;
                    }
                }
            }

            return { $match: q };
        },
        GetRef: function (id, cb) {
            this.findOne({ _id: id }).select("ref").exec(function (err, result) {
                if (err) return cb(err);

                cb(null, result.ref);
            });
        }


    };

}