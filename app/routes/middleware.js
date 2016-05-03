var Boom = require("boom");
var _=require("lodash");
var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var Log = require(C.lib + "logger")
const Middleware = {};



Middleware.Body = function () {

    return function* (next) {
        var body=this.request.body;
        if (body==void 0 || _.isEmpty(body)) Response.Error(this, Boom.badRequest(i18n.E.lack_of_body));
        else
            yield next;
    }

}

Middleware.Wrapper = function (fn) {

    return function* () {
        fn(this);
    }

}

Middleware.Error = function () {

    return function* (next) {
        try {
            yield next;
        } catch (err) {
            Log.error(err);
            Response.Error(this, err);
        }
    }

}


Middleware.NoRoute = function () {
    return function* () {
        Response.Success(this, i18n.M.welcome);
    };
}



module.exports = Middleware;