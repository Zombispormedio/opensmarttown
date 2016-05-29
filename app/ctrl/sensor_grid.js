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

var Controller = {};

Controller.Get = $(function (params, cb) {
    var pipeline = [];
    SensorGridModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);
    SensorGridModel.DefaultFormat(pipeline);


    async.waterfall([
        function (next) {
            SensorGridModel.aggregate(pipeline).exec(next);
        },
        SensorRefs,
        ZoneRef,
        Format(params.format)


    ], cb);



});


var SensorRefs = function (grids, cb) {

    async.map(grids, function (item, next) {

        SensorModel.GetRefs(item.sensors, function (err, refs) {
            if (err) return next(err);

            item.sensors = refs;
            next(null, item);
        });


    }, cb);


}

var ZoneRef = function (grids, cb) {
    async.map(grids, function (item, next) {

        ZoneModel.GetRef(item.zone, function (err, ref) {
            if (err) return next(err);

            item.zone = ref;
            next(null, item);
        });


    }, cb);
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


module.exports = Controller;