var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var Handlebars = require(C.lib + "handlebars");

var SensorGridModel = require(C.models + "sensor_grid")
var SensorModel = require(C.models + "sensor")

var ZoneModel = require(C.models + "zone")
var ZoneCtrl = require(C.ctrl + "zone")


const Controller = {};


Controller.GetGrid = function (params, cb) {

    if (ParamsValidation(params)) {
        var pipeline = [];
        var match=SensorGridModel.match(params);
        
       if (!match){
          
           return Format(params.format)([],cb);
        } 
        
        pipeline.push(match);

        GetSensorGrid(pipeline, params, cb);
    } else {
        Format(params.format)([],cb);
    }


};


Controller.Get = $(Controller.GetGrid);


Controller.ByID = function (params, cb) {
    var pipeline = [];
    var match = { $match: { _id: params.id } };
    pipeline.push(match);

    params = _.omit(params, ["id"]);

    GetSensorGrid(pipeline, params, cb);

};


var GetSensorGrid = function (pipeline, params, cb) {
    mongo.paginateAggregation(pipeline, params.page, params.size);
    SensorGridModel.DefaultFormat(pipeline, params);

    var exec_pipeline = [
        function (next) {
            SensorGridModel.aggregate(pipeline).exec(next);
        }
    ];

    if (params.no_sensors !== "true") {
        exec_pipeline.push(SensorRefs);
    }
    exec_pipeline.push(ZoneRef(params));

    exec_pipeline.push(Format(params.format));

    async.waterfall(exec_pipeline, cb);
}



var SensorRefs = function (grids, cb) {

    async.map(grids, function (item, next) {

        SensorModel.GetRefs(item.sensors, function (err, refs) {
            if (err) return next(err);

            item.sensors = refs;
            next(null, item);
        });


    }, cb);


}

var ZoneRef = function (params) {

    return function (grids, cb) {

        async.map(grids, function (item, next) {

            if (params.onlyRefs === "false") {
                var p = {
                    id: item.zone,
                    no_shape: params.no_shape,
                    sensor_count: "false"
                }
                ZoneCtrl.ByID(p, function (err, zone) {
                    if (err) return next(err);
                    item.zone = zone[0];
                    next(null, item);
                });
            } else {
                ZoneModel.GetRef(item.zone, function (err, ref) {
                    if (err) return next(err);
                    item.zone = ref;
                    next(null, item);
                });
            }
        }, cb);
    }
}



var Format = function (format) {
    return function (grids, cb) {
        var result = grids;
        switch (format) {
            case "geojson": result = GeoJSON(grids);
                cb(null, result);
                break;
            case "kml": result = KML(grids, cb);
                break;

            default:
                cb(null, result);
        }



    }
}

var GeoJSON = function (grids) {

    var result = grids.map(function (item) {
        var j = {};
        j.type = "Feature";

        j.geometry = {
            type: "Point",
            coordinates: item.location
        }

        var p = {};
        p.ref = item.ref;
        p.display_name = item.display_name
        p.device_name = item.device_name
        p.description = item.description

        p.zone = item.zone
        if (item.sensors)
            p.sensors = item.sensors


        j.properties = p;

        return j;
    });



    return result;
}

const KML_TEMPLATE = C.templates + "sensor_grid.handlevars.kml"

var KML = function (grids, cb) {

    Handlebars(KML_TEMPLATE, grids, cb);

}

Controller.NearIDs = $(function (c_str, max_str, cb) {
    var coords = c_str.split(",").map(function (a) { return Number(a); });
    var max = Number(max_str);
    var q_near = SensorGridModel.near(coords, max);

    SensorGridModel.find({ "location": q_near })
        .select("_id")
        .exec(function (err, result) {
            if (err) return err;
            var ids = result.map(function (item) {
                return item._id;
            });

            cb(null, ids);
        });
})

var ParamsValidation = function (params) {

    var EmptyArrayIDs = [
        params.nearIDs,
        params.magnitudeIDs,
        params.GridIDsByZone
    ].every(function (item) {
        var valid = true;

        if (item) {
            valid = item.length > 0;
        }

        return valid;
    });

    return EmptyArrayIDs;
}

Controller.GridIDsByZone = $(function (ref, cb) {
    ZoneModel.findOne({ ref: ref }).select("_id").exec(function (err, z) {
        if (err) return cb(err);
        if (!z)return cb(null, []);
        var zone_id = z._id;

        SensorGridModel.aggregate([
            { $match: { zone: zone_id } },
            {
                $group: {
                    _id: "$zone",
                    grids: { $push: "$_id" }
                }
            }

        ]).exec(function (err, result) {
            if (err) return cb(err);

            if (result.length === 0) return cb(null, []);
          
            cb(null, result[0].grids)

        });


    });

});



module.exports = Controller;