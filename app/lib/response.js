var _ = require("lodash");

const Response = {};

Response.Error = function (ctx, error) {
    var obj = {
        success: false,
        errors: []
    }
    console.log(typeof error)
    console.log(error);

    if (Array.isArray(error)) {
        obj.errors = error;
    } else {
        if (error.isBoom) {
            var out = error.output;
            obj.errors.push(out.payload);

            ctx.status = out.statusCode;

        } else {
            if (_.isError(error)) {
                obj.errors.push(error.toString());
            } else {
                obj.errors.push(error);
            }


        }


    }

    ctx.body = obj;


}

Response.Success = function (ctx, data) {
    var obj = {
        success: true
    };
    if (typeof data == "string") {
        obj.message = data;
    } else {
        obj.result = data;
    }

    ctx.body = obj;
}


module.exports = Response;