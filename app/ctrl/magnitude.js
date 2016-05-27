var Boom = require("boom");

var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")

var MagnitudeModel = require(C.models + "magnitude")

var Controller = {};

Controller.Get = $(function (params, cb) {
    var pipeline = [];
    var project = {
        $project: {
            _id: 0, ref: 1, display_name: 1,
            type: {
                $cond: {
                    if: { $eq: ["$type", "0"] }, then: i18n.C.ANALOG, else: i18n.C.DIGITAL
                }
            },
            units: {
                $cond: {
                    if: { $eq: ["$type", "0"] }, then: {
                        $map: {
                            input: "$analog_units", as: "unit", in: { display_name: "$$unit.display_name", symbol: "$$unit.symbol" }
                        }
                    }, else: { on: "$digital_units.on", off: "$digital_units.on" }
                }
            },
            conversions: 1,
            analog_units: 1

        }

    };

    pipeline.push(project);

    mongo.paginateAggregation(pipeline, params.page);


    var q = MagnitudeModel.aggregate(pipeline)

    q.exec(function (err, result) {
        if (err) return cb(err);

        var magnitudes = result.map(function (item) {
            var magnitude = _.omit(item, ["conversions", "analog_units"]);

            if (magnitude.type === i18n.C.ANALOG) {
                var analog = item.analog_units;

                magnitude.conversions = item.conversions.reduce(function (prev, c) {
                    var unitA = _.find(analog, function (a) {
                        return a._id.equals(c.unitA);
                    });

                    var unitB = _.find(analog, function (a) {
                        return a._id.equals(c.unitB);
                    });


                    if (unitA != void 0 && unitB != void 0) {
                        var conversion = _.omit(c, ["_id", "unitA", "unitB"]);

                        conversion.unitA = unitA.display_name;

                        conversion.unitB = unitB.display_name;
                        prev.push(conversion);
                    }


                    return prev;
                }, []);

            }

            return magnitude;

        });

        cb(null, magnitudes);

    });

});


module.exports = Controller;