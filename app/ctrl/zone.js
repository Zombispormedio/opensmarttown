var Boom = require("boom");

var _ = require("lodash");
var $ = require('thunkify');

var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var Handlebars = require(C.lib + "handlebars");
var ZoneModel = require(C.models + "zone")

var Controller = {};

Controller.getZone = function (params, cb) {
    var pipeline = [];
    ZoneModel.match(pipeline, params);
    ZoneByPipeline(pipeline, params, cb)

};
Controller.Default = $(Controller.getZone);

Controller.ByID = function (params, cb) {
    var pipeline = [];
    var match = { $match: { _id: params.id } };
    pipeline.push(match);

    params = _.omit(params, ["id"]);

    ZoneByPipeline(pipeline, params, cb)
}


var ZoneByPipeline = function (pipeline, params, cb) {
    mongo.paginateAggregation(pipeline, params.page);
    var project = ZoneModel.DefaultFormat(params);
    pipeline.push(project);

    ZoneModel.aggregate(pipeline).exec(cb);
}

Controller.GeoJSON = $(function (params, cb) {
    var pipeline = [];
    ZoneModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);

    var project = ZoneModel.GeoJSONFormat();
    pipeline.push(project);

    ZoneModel.aggregate(pipeline).exec(function (err, result) {
        if (err) return cb(err);

        result = result.map(function (item) {
            if (item.geometry.type === "Polygon") {
                item.geometry.coordinates = [item.geometry.coordinates]
            }

            return item;
        });
        cb(void 0, result);
    });
});

const KML_TEMPLATE = C.templates + "zone.handlevars.kml"

Controller.KML = $(function (params, cb) {
    var pipeline = [];
    ZoneModel.match(pipeline, params);
    mongo.paginateAggregation(pipeline, params.page);

    var project = ZoneModel.DefaultFormat();
    pipeline.push(project);

    ZoneModel.aggregate(pipeline).exec(function (err, zones) {
        if (err) return cb(err);
        Handlebars(KML_TEMPLATE, zones, cb);
    });
});


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

module.exports = Controller;