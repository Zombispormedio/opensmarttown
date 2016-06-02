var Boom = require("boom");

var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")

var MagnitudeModel = require(C.models + "magnitude")

const Controller = {};

Controller.Get = $(function (params, cb) {
    var pipeline = [];

    MagnitudeModel.match(pipeline, params);

    MagnitudeModel.format(pipeline, params);

    mongo.paginateAggregation(pipeline, params.page);


    var q = MagnitudeModel.aggregate(pipeline)

    q.exec(function (err, result) {
        if (err) return cb(err);

        var magnitudes=formatConversion(result);

        cb(null, magnitudes);

    });

});


var formatConversion = function (result) {
    return result.map(function (item) {
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
}


module.exports = Controller;