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
                match.date = {};
                if (validFrom) {
                    match.date.$gte = dateFrom;
                }

                if (validTo) {
                    match.date.$lte = dateTo;
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



Controller.GetStats = function (params, cb) {
    var pipeline = [];


    var elemsType = params.type.split(",");
    var validFrom = false;
    var validTo = false;
    var match = {};
    if (params) {

        if (params.sensors) {
            if (params.sensors.length > 0) {
                match.node_id = { $in: params.sensors };
            }
        }



        if (params.from || params.to) {
            var dateFrom = new Date(params.from);
            var dateTo = new Date(params.to);

            validFrom = utils.isValidDate(dateFrom);
            validTo = utils.isValidDate(dateTo);
            if (validFrom || validTo) {
                match.date = {};
                if (validFrom) {
                    match.date.$gte = dateFrom;
                }

                if (validTo) {
                    match.date.$lte = dateTo;
                }
            }
        }


    }


    if (Object.keys(match).length > 0) {

        pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { "date": -1 } });

    var group = {

        avg_value: { $avg: "$value" },
        max_value: { $max: "$value" },
        min_value: { $min: "$value" },
        count: { $sum: 1 }

    }

    var groupById = {

        stats: {
            $push: {
                avg_value: "$avg_value",
                max_value: "$max_value",
                min_value: "$min_value",
                count: "$count"
            }
        }
    }

    if (!params.no_id) {
        group._id = {
            node_id: "$node_id",
        }
        groupById._id = "$_id.node_id"
    } else {
        group._id = {};
        groupById._id = null;
    }


    elemsType.forEach(function (item) {
        switch (item) {
            case "hour":
                group._id.hour = { $hour: "$date" };
                groupById.stats.$push.hour = "$_id.hour";
                break;
            case "day":
                group._id.day = { $dayOfMonth: "$date" };
                groupById.stats.$push.day = "$_id.day";
                break;
            case "month":
                group._id.month = { $month: "$date" };
                groupById.stats.$push.month = "$_id.month";
                break;
            case "originOfTime":
                if (params.no_id) {
                    group._id = null;
                }
                groupById.stats.$push.time = { $literal: "Origin Of Time" };
                break;
            case "year":
            default:
                group._id.year = { $year: "$date" };
                groupById.stats.$push.year = "$_id.year";
        }
    });





    pipeline.push({ $group: group });



    pipeline.push({ $group: groupById });






    SensorRegistryModel.aggregate(pipeline).exec(cb);
}



module.exports = Controller;