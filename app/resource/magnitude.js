const SIZE = process.env.OPEN_API_PAGINATION;
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
module.exports = function (Schema) {

    Schema.statics = {

        format: function (pipeline) {
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
        },

        match: function (pipeline, params) {
            var q = {};
            if (params.ref && params.ref !== "") {
                q.ref = Number(params.ref);
            }

            pipeline.push({ $match: q });

        }

    }

}