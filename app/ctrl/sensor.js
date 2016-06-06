var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var Handlebars = require(C.lib + "handlebars");

var SensorGridModel = require(C.models + "sensor_grid")
var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var SensorRegistryCtrl = require(C.ctrl + "sensor_registry")

var SensorModel = require(C.models + "sensor");
var MagnitudeModel = require(C.models + "magnitude");
var ZoneModel = require(C.models + "zone")

const Controller = {};


Controller.GetSensor = function (params, cb) {

    if (ParamsValidation(params)) {
        var exec_pipeline = GetSensorByPipeline(params);
        if (!exec_pipeline) return cb(null, []);

        exec_pipeline.push(Omit);

        async.waterfall(exec_pipeline, cb);
    } else {
        cb(void 0, []);
    }



}

Controller.GetSensorWithFormat = function (params, cb) {

    if (ParamsValidation(params)) {
        var exec_pipeline = GetSensorByPipeline(params);
        if (!exec_pipeline) return cb(null, []);

        exec_pipeline.push(Omit);
        exec_pipeline.push(Format(params.format));

        async.waterfall(exec_pipeline, cb);
    } else {
        cb(void 0, []);
    }

}

Controller.GetSensorNotOmitID = function (params, cb) {
    if (ParamsValidation(params)) {
        var exec_pipeline = GetSensorByPipeline(params);

        if (!exec_pipeline) return cb(null, []);

        async.waterfall(exec_pipeline, cb);
    } else {
        cb(void 0, []);
    }

}

var GetSensorByPipeline = function (params) {
    var pipeline = [];
    var match = SensorModel.match(params);

    if (match) {
        pipeline.push(match);
    } else {
        return null;
    }

    mongo.paginateAggregation(pipeline, params.page, params.size);
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
    return exec_pipeline;

}


Controller.Get = $(Controller.GetSensorWithFormat);



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



var GridByMagnitude = function (ref, cb) {
    MagnitudeModel.findOne({ ref: Number(ref) }, function (err, result) {
        if (err) return cb(err);
        if (!result) return cb(i18n.E.no_magnitude);

        var pipeline = [
            {
                $match: {
                    magnitude: result._id
                }
            },
            {
                $group: {
                    "_id": "$magnitude",
                    "grids": { $addToSet: "$sensor_grid" }
                }
            }
        ];

        SensorModel.aggregate(pipeline).exec(function (err, r) {
            if (err) return cb(err);
            if (r[0]) {
                cb(null, r[0].grids);
            } else {
                cb(null, []);
            }

        });


    });
}

Controller.GridIDsByMagnitude = $(GridByMagnitude);

Controller.ZoneIDsByMagnitude = $(function (ref, cb) {
    GridByMagnitude(ref, function (err, grids) {
        if (err) return cb(err);


        SensorGridModel.find({ _id: { $in: grids } }).select("zone").exec(function (err, result) {
            if (err) return cb(err);

            cb(null, result.map(function (item) {
                return item.zone;
            }));

        });

    });
});


Controller.SensorIDsByGrid = $(function (ref, cb) {
    SensorGridModel.findOne({ ref: Number(ref) }, function (err, result) {
        if (err) return cb(err);

        cb(null, result.sensors);
    });
});


Controller.SensorIDsByZone = $(function (ref, cb) {
    ZoneModel.findOne({ ref: ref }).select("_id").exec(function (err, z) {
        if (err) return cb(err);
        var zone_id = z._id;

        SensorGridModel.aggregate([
            { $match: { zone: zone_id } },
            {
                $group: {
                    _id: "$zone",
                    sensors: { $push: "$sensors" }
                }
            }

        ]).exec(function (err, result) {
            if (err) return cb(err);

            if (result.length === 0) return cb(null, []);

            cb(null, _.flatten(result[0].sensors))

        });


    });

});




var Omit = function (sensors, cb) {

    async.map(sensors, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}

var Stats = function (sensors, cb) {
    if (sensors.length == 0) return cb(null, cb);
    var params = {
        sensors: sensors.map(function (a) {
            return a._id;
        })
    }

    SensorRegistryCtrl.GetSensorStats(params, function (err, result) {
        if (err) return cb(err);
        result.forEach(function (item) {
            var sensor = _.find(sensors, function (z) {
                return z._id.equals(item._id);
            });

            if (sensor) {
                sensor.stats = _.omit(item, ["_id"]);

            }
        });

        cb(null, sensors);
    });

}


var ParamsValidation = function (params) {

    var EmptyArrayIDs = [
        params.magnitudeIDs,
        params.SensorIDsByGrid,
        params.nearGridIDs,
        params.SensorIDsByZone
    ].every(function (item) {
        var valid = true;

        if (item) {
            valid = item.length > 0;
        }

        return valid;
    });

    return EmptyArrayIDs;
}


var Format = function (format) {
    return function (sensors, cb) {
        var result = sensors;
        switch (format) {
            case "geojson": result = GeoJSON(sensors);
                cb(null, result);
                break;
            case "kml": result = KML(sensors, cb);
                break;

            default:
                cb(null, result);
        }
    }
}

Controller.FormatSensor = Format;

var GeoJSON = function (sensors) {

    var result = sensors.map(function (item) {
        var j = {};
        j.type = "Feature";
        var p = {};
        if (_.isObject(item.grid)) {
            j.geometry = {
                type: "Point",
                coordinates: item.grid.location
            }
            
            p.grid={
                ref:item.grid.ref,
                display_name:item.grid.display_name,
                zone:{
                    ref:item.grid.zone.ref,
                    display_name:item.grid.zone.display_name,
                }         
            }
        }else{
           p.grid =item.grid; 
        }

        p.ref = item.ref;
        p.display_name = item.display_name
        p.device_name = item.device_name
        p.description = item.description
        p.magnitude = item.magnitude;
        p.unit = item.unit;
        p.last_sync = item.last_sync;
        
        if(item.current){
            p.current=item.current;
        }
        
         if(item.history){
            p.history=item.history;
        }
        
         if(item.stats){
            p.stats=item.stats;
        }
        

        j.properties = p;

        return j;
    });



    return result;
}

const KML_TEMPLATE = C.templates + "sensors.handlevars.kml"

var KML = function (sensors, cb) {
    console.log(sensors);
    Handlebars(KML_TEMPLATE, sensors, cb);

}



module.exports = Controller;