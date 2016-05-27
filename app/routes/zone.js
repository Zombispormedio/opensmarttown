var Router = require('koa-router');

var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var ZoneCtrl = require(C.ctrl + "zone")

var middleware = require(C.routes + "middleware")

const PREFIX = '/zones';


var router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

router.get('/', function* () {
    var format = this.query.format;
    switch (format) {
        case "kml":
            this.body = yield ZoneCtrl.KML(this.query);

            break;
        case "geojson":
            var result = yield ZoneCtrl.GeoJSON(this.query);
            Response.SuccessGeoJSON(this, result);
            break;
        default:
            var result = yield ZoneCtrl.Default(this.query);
            Response.Success(this, result);

    }


});






module.exports = router;