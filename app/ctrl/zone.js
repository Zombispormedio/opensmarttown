var Boom = require("boom");

var _ = require("lodash");
var $ = require('thunkify');
var async = require("async");
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var Handlebars = require(C.lib + "handlebars");
var ZoneModel = require(C.models + "zone")
var SensorGridModel = require(C.models + "sensor_grid")
const Controller = {};

Controller.getZone = function (params, cb) {
    if (ParamsValidation(params)) {
        var pipeline = [];
        var match=ZoneModel.match(params);
        if(!match)return cb(null,[]);
        pipeline.push(match);
        
        ZoneByPipeline(pipeline, params, cb)
    } else {
        cb(void 0, []);
    }


};
Controller.Get = $(Controller.getZone);

Controller.ByID = function (params, cb) {
    var pipeline = [];
    var match = { $match: { _id: params.id } };
    pipeline.push(match);

    params = _.omit(params, ["id"]);

    ZoneByPipeline(pipeline, params, cb)
}


var ZoneByPipeline = function (pipeline, params, cb) {
    mongo.paginateAggregation(pipeline, params.page, params.size);

    var project = ZoneModel.DefaultFormat(params);


    pipeline.push(project);

    var exec_pipeline = [
        function (next) {
            ZoneModel.aggregate(pipeline).exec(next);
        }
    ];

    if (params.sensor_count !== "false") {
        exec_pipeline.push(SensorCount);
    }


    exec_pipeline.push(Omit);


    exec_pipeline.push(Format(params.format));



    async.waterfall(exec_pipeline, cb);

}

var Format = function (format) {
    return function (zones, cb) {
        var result = zones;
        switch (format) {
            case "geojson": result = GeoJSON(zones);
                cb(null, result);
                break;
            case "kml": result = KML(zones, cb);
                break;

            default:
                cb(null, result);
        }
    }
}




var GeoJSON = function (zones) {

    var result = zones.map(function (item) {
        var j = {};
        j.type = "Feature";
        var p = {};
        if (item.shape) {
            var geom = {};

            switch (item.shape.type) {
                case "rectangle":
                    geom.type = "Polygon",
                        geom.coordinates = [item.shape.bounds];
                    break;
                case "polygon":
                    geom.type = "Polygon",
                        geom.coordinates = [item.shape.paths];
                    break;
                case "circle":
                    geom.type = "Point",
                        geom.coordinates = item.shape.center;
                    break;

            }
            j.geometry = geom;
            p.shape = {
                type: item.shape.type
            };

            if (item.shape.type === "circle") {
                p.shape.radius = item.shape.radius;
            }
        }



        p.ref = item.ref;
        p.display_name = item.display_name
        p.keywords = item.keywords
        p.description = item.description
        p.num_grids = item.num_grids;
        p.num_sensors = item.num_sensors;


        p.lookAt = { type: "Point", coordinates: item.lookAt }
        j.properties = p;

        return j;
    });



    return result;

}

const KML_TEMPLATE = C.templates + "zone.handlevars.kml"


var KML = function (zones, cb) {

    Handlebars(KML_TEMPLATE, zones, cb);

}



Controller.NearIDs = $(function (c_str, max_str, cb) {
    var coords = c_str.split(",").map(function (a) { return Number(a); });
    var max = Number(max_str);
    var q_near = ZoneModel.near(coords, max);

    ZoneModel.find({ "shape.paths": q_near })
        .select("_id")
        .exec(function (err, result) {
            if (err) return err;
            var ids = result.map(function (item) {
                return item._id;
            });

            cb(null, ids);
        });


});

var SensorCount = function (zones, cb) {
    var params = {
        zones: zones.map(function (a) {
            return a._id;
        })
    }
    
 
    SensorGridModel.GetCountsByZone(params, function (err, result) {
        if (err) return cb(err);
   
   
        zones.forEach(function(zone){
           var r=_.find(result, function(item) {
               return zone._id.equals(item._id);
           }) 
           
            if (r) {
                zone.num_sensors = r.num_sensors;
                zone.num_grids = r.num_grids;
            }else{
                zone.num_sensors = 0;
                zone.num_grids = 0;
            }
        });

        cb(null, zones);

    });

}

var Omit = function (zones, cb) {

    async.map(zones, function (item, next) {
        item = _.omit(item, ["_id"]);
        next(null, item);
    }, cb);

}

var ParamsValidation = function (params) {

    var EmptyArrayIDs = [
        params.nearIDs,
        params.magnitudeIDs
    ].every(function (item) {
        var valid = true;

        if (item) {
            valid = item.length > 0;
        }

        return valid;
    });

    return EmptyArrayIDs;
}


module.exports = Controller;