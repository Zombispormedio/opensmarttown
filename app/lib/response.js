var _ = require("lodash");

const Response = {};

Response.Error = function (ctx, error) {
    var obj = {
        success: false,
        errors: [],
        url:process.env.OPEN_API_HOST+ctx.url
    }
  
    if (Array.isArray(error)) {
        obj.errors = error;
    } else {
        if (error.isBoom) {
            var out = error.output;
            obj.errors.push(out.payload);
            ctx.status = out.statusCode;

        } else {
            if (_.isError(error)) {
                obj.errors.push({message:error.toString()});
            } else {
                obj.errors.push({message:error});
            }
        }
    }
   
    ctx.body = obj;
}

Response.Success = function (ctx, data) {
    var obj = {
        success: true,
          url:process.env.OPEN_API_HOST+ctx.url
    };
    if (typeof data == "string") {
        obj.message = data;
    } else {
        obj.result = data;
    }

    ctx.body = obj;
}

Response.SuccessGeoJSON = function (ctx, data) {
    var obj = {
      "type": "FeatureCollection",
      success:true,
       url:process.env.OPEN_API_HOST+ctx.url
    };
    
    if(Array.isArray(data)){
        obj.features=data;
    }else{
        obj.features=[data];
    }
    
    
    ctx.body = obj;
}


module.exports = Response;