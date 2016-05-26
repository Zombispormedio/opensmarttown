var Boom = require("boom");
const SIZE = Number(process.env.OPEN_API_PAGINATION);
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")

var MagnitudeModel = require(C.models + "magnitude")

var Controller = {};

Controller.Get = $(function (params, cb) {
    var q = MagnitudeModel.aggregate([
        {
            $project: {
                _id: 0, ref: 1, display_name: 1,
                type: {
                    $cond: {
                        if: { $eq: ["$type", "0"] }, then: "ANALOG", else: "DIGITAL"
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
                }

            }
           
        },{

            $limit:SIZE
        }

    ])

    q.exec(cb);

    //MagnitudeModel.find({}).exec(cb);

});


module.exports = Controller;