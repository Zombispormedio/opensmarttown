var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")
var utils = require(C.lib + "utils")

var SensorRegistryModel = require(C.models + "sensor_registry")


const Controller = {};


Controller.GetSensorStats = function (params, cb) {
    var pipeline = [];

    if (params) {
        var match = {};
        if (params.sensors) {
            if (params.sensors.length > 0) {
                match.node_id = { $in: params.sensors };
            }
        }


        if (Object.keys(match) > 0) {
            pipeline.push({ $match: match });
        }
    }

    var group = {
        $group: {
            _id: "$node_id",
            avg_value: { $avg: "$value" },
            max_value: { $max: "$value" },
            min_value: { $min: "$value" }
        }
    }
    pipeline.push(group);


    SensorRegistryModel.aggregate(pipeline).exec(cb);
}

Controller.GetHistory = function (params, cb) {
    var pipeline = [];

    if (params) {
        var match = {};
        if (params.sensors) {
            if (params.sensors.length > 0) {
                match.node_id = { $in: params.sensors };
            }
        }

        if (params.from || params.to) {
            var dateFrom = new Date(params.from);
            var dateTo = new Date(params.to);
           
            var validFrom = utils.isValidDate(dateFrom);
            var validTo = utils.isValidDate(dateTo);
            if (validFrom || validTo) {
                match.date={};
                if(validFrom){
                    match.date.$gte=dateFrom;
                }
                
                if(validTo){
                    match.date.$lte=dateTo;
                }
            }
        }

 


        if (Object.keys(match).length > 0) {
               
            pipeline.push({ $match: match });
        }
    }


    pipeline.push({ $sort: { "date": -1 } });
    mongo.paginateAggregation(pipeline, params.page, params.size, false);
    var group = {
        $group: {
            _id: "$node_id",
            history: { $push: "$$ROOT" }
        }
    }

    pipeline.push(group);


    var project = {
        $project: {
            history: {
                value: 1,
                date: 1
            }

        }
    }
    pipeline.push(project);



    SensorRegistryModel.aggregate(pipeline).exec(cb);
}



module.exports = Controller;