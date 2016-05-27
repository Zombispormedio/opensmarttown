var C = require("../../config/main")

var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var middleware = require(C.routes + "middleware")
var developer = require(C.routes + "developer")
var catalog = require(C.routes + "catalog")
var magnitude = require(C.routes + "magnitude")
var zone = require(C.routes + "zone")

module.exports = function (app) {


    app.use(middleware.Error());

    app.use(developer.routes())
        .use(developer.allowedMethods());

    app.use(catalog.routes())
        .use(catalog.allowedMethods());

    app.use(magnitude.routes())
        .use(magnitude.allowedMethods());
        
    app.use(zone.routes())
        .use(zone.allowedMethods());

    app.use(middleware.NoRoute());


}