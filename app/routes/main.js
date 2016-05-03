var C = require("../../config/main")

var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var middleware = require(C.routes + "middleware")
var developer = require(C.routes + "developer")

module.exports = function (app) {


    app.use(middleware.Error());

    app.use(developer.routes())
        .use(developer.allowedMethods());

    app.use(middleware.NoRoute());


}