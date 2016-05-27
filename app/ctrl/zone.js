var Boom = require("boom");

var _ = require("lodash");
var $ = require('thunkify');

var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var Handlebars=require(C.lib +"handlebars");
var ZoneModel = require(C.models + "zone")

var Controller = {};

Controller.Default = $(function (params, cb) {
    var pipeline = [];
    var project = ZoneModel.DefaultFormat();
    pipeline.push(project);
    
    mongo.paginateAggregation(pipeline, params.page);
    
    ZoneModel.aggregate(pipeline).exec(cb);
});


Controller.GeoJSON = $(function (params, cb) {
    var pipeline = [];
    var project = ZoneModel.GeoJSONFormat();
    pipeline.push(project);
    
    mongo.paginateAggregation(pipeline, params.page);
    
    ZoneModel.aggregate(pipeline).exec(cb);
});

const KML_TEMPLATE=C.templates+"zone.handlevars.kml"

Controller.KML = $(function (params, cb) {
    var pipeline = [];
    var project = ZoneModel.DefaultFormat();
    pipeline.push(project);
    
    mongo.paginateAggregation(pipeline, params.page);
    
    ZoneModel.aggregate(pipeline).exec(function(err, zones){
        if(err)return cb(err);
             
       
        Handlebars(KML_TEMPLATE, zones, cb);
        
        
    });
});

module.exports = Controller;