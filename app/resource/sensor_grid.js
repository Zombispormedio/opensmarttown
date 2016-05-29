const SIZE = process.env.OPEN_API_PAGINATION;
var C = require("../../config/main")


module.exports = function (Schema) {

    Schema.statics = {

        DefaultFormat: function (pipeline) {
            var pre = {};

            pre._id = 0;
            pre.display_name = 1;
            pre.device_name = 1;
            pre.ref = 1
            pre.description = 1;
            pre.location = 1
            pre.sensors = 1;
            pre.zone = 1;

            var project = { $project: pre };

            pipeline.push(project);

        }

    }

}