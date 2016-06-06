var Boom = require("boom");
var async = require("async");
var _ = require("lodash");

var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorCtrl = require(C.ctrl + "sensor")
var SensorGridModel = require(C.models + "sensor_grid");
var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var ZoneModel = require(C.models + "zone");
var ZoneCtrl = require(C.ctrl + "zone")
var MagnitudeModel = require(C.models + "magnitude");
var MagnitudeCtrl = require(C.ctrl + "magnitude");

const Controller = {};

Controller.Get = $(function (cb) {
    var worker = {};

    async.waterfall([
        function (next) {
            next(null, worker);
        },
        ZoneGeneralStats,
        MagnitudeGeneralStats,
        SensorGeneralStats,
        SensorGridGeneralStats
    ], cb);


});


var ZoneGeneralStats = function (worker, cb) {

    ZoneModel.find({}).select("_id ref display_name").exec(function (err, zones) {
        if (err) return next(err);
        zones = zones.map(function (i) { return i.toObject() });
        worker.total_zones = zones.length;

        ZoneCtrl.SensorCountByZone(zones, function (err, result) {
            if (err) return next(err);

            worker.total_sensors = _.sumBy(result, function (item) { return item.num_sensors; })
            worker.total_grids = _.sumBy(result, function (item) { return item.num_grids; })
            
            
            
            worker.avg_sensors_by_zone = _.meanBy(result, function (item) { return item.num_sensors; })
          
            worker.zone_with_max_sensors = _.omit(_.maxBy(result, function (item) { return item.num_sensors; }), ["_id", "num_grids"]);

            worker.zone_with_min_sensors =_.omit( _.minBy(result, function (item) { return item.num_sensors; }), ["_id", "num_grids"]);
            

           

            worker.avg_grids_by_zone = _.meanBy(result, function (item) { return item.num_grids; })

            worker.zone_with_max_grids = _.omit(_.maxBy(result, function (item) { return item.num_grids; }), ["_id", "num_sensors"])

            worker.zone_with_min_grids = _.omit(_.minBy(result, function (item) { return item.num_grids; }), ["_id", "num_sensors"])



            cb(null, worker)
        });
    });

}


var MagnitudeGeneralStats=function (worker, cb) {
    
     MagnitudeModel.find({}).select("_id ref display_name").exec(function (err, magnitudes) {
        if (err) return next(err);
        
        magnitudes = magnitudes.map(function (i) { return i.toObject() });
        worker.total_magnitudes=magnitudes.length;
        
        
        MagnitudeCtrl.SensorsCountByMagnitude(magnitudes, function(err, result){
             
            worker.avg_sensors_by_magnitude = _.meanBy(result, function (item) { return item.num_sensors; })
          
            worker.magnitude_with_max_sensors = _.omit(_.maxBy(result, function (item) { return item.num_sensors; }), ["_id"]);

            worker.magnitude_with_min_sensors =_.omit( _.minBy(result, function (item) { return item.num_sensors; }), ["_id"]);
            

           

            worker.avg_grids_by_magnitude = _.meanBy(result, function (item) { return item.num_grids; })

            worker.magnitude_with_max_grids = _.omit(_.maxBy(result, function (item) { return item.num_grids; }), ["_id"])

            worker.magnitude_with_min_grids = _.omit(_.minBy(result, function (item) { return item.num_grids; }), ["_id"])
            
            cb(null, worker);
        });
     });
    
}

var SensorGeneralStats=function(worker, cb){
    
    SensorModel.findOne({}).select("ref display_name last_sync").sort([["last_sync", "descending"]]).exec(function(err, r1){
        if(err)return cb(err);
        
        worker.last_synchronized_sensor=_.omit(r1.toObject(), ["_id"]);
        
        
         SensorModel.findOne({}).select("ref display_name created_at").sort([["created_at", "descending"]]).exec(function(err, r2){
              if(err)return cb(err);
              
               worker.last_created_sensor=_.omit(r2.toObject(), ["_id"]);
              
              cb(null, worker);
              
         });
        
        
        
        
    });
    
    
}

var SensorGridGeneralStats=function(worker, cb){
    
    SensorGridModel.aggregate([
         {$project:{
            _id:0, ref:1, display_name:1, num_sensors:{$size:"$sensors"}
         }},
         {$sort:{"num_sensors":-1}}
        
    ]).exec(function(err, r1){
        if(err)return cb(err);
        
        if(r1.length===0)return cb("No Grids");
        
        worker.grid_with_max_sensors=r1[0];
        worker.grid_with_min_sensors=r1[r1.length-1];
        cb(null, worker);
        
    });
    
};

module.exports = Controller;