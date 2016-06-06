const SIZE = process.env.OPEN_API_PAGINATION;
var C = require("../../config/main")
var _ = require("lodash")
var i18n = require(C.lib + "i18n")
module.exports = function (Schema) {

    Schema.statics = {

        format: function (pipeline) {
            var project = {
                $project: {
                   ref: 1, display_name: 1,
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
                            }, else: { on: "$digital_units.on", off: "$digital_units.off" }
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

        },
        ThisAndUnit: function (options, cb) {
            this.findOne({ _id: options.magnitude }).select("display_name ref analog_units type digital_units").exec(function (err, result) {
                if (err) return cb(err);
                var unit=void 0;
                result=result.toObject();
                
                var magnitude = options.onlyRefs==="false"?result.display_name:result.ref;

                if(result.type === "0"){
                    
                    var t=_.find(result.analog_units, function (o) { return o._id.equals(options.unit) });
                    if(t!= void 0){
                        unit=_.omit(t, ["_id"]);
                   
                    }
                    
                }else{
                    unit=_.omit(result.digital_units, ["_id"]);
                }


                 cb(null, magnitude, unit);

            });
        }

    }

}