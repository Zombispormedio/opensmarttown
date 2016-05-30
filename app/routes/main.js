var C = require("../../config/main")

var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var middleware = require(C.routes + "middleware")
var developer = require(C.routes + "developer")
var catalog = require(C.routes + "catalog")
var magnitude = require(C.routes + "magnitude")
var zone = require(C.routes + "zone")
var sensor_grid = require(C.routes + "sensor_grid")
var sensor = require(C.routes + "sensor")
var current = require(C.routes + "current")

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

    app.use(sensor_grid.routes())
        .use(sensor_grid.allowedMethods());

    app.use(sensor.routes())
        .use(sensor.allowedMethods());

    app.use(current.routes())
        .use(current.allowedMethods());

    app.use(middleware.NoRoute());


}