var Router = require('koa-router');
var _ = require("lodash")
var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var StatsCtrl = require(C.ctrl + "stats_zone")
var ZoneCtrl = require(C.ctrl + "zone")
var SensorCtrl = require(C.ctrl + "sensor")


var middleware = require(C.routes + "middleware")

const PREFIX = '/stats_by_zone';


var router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {
    var query = _.cloneDeep(this.query);
    var format = query.format;

    query.ref = this.params.id;

    if (query.near) {
        query.nearIDs = yield ZoneCtrl.NearIDs(query.near, query.max_distance);
    }


    var result = yield StatsCtrl.GetZoneStats(query);

    switch (format) {
        case "kml":
            Response.SuccessXML(this, result);

            break;
        case "geojson":

            Response.SuccessGeoJSON(this, result);
            break;
        default:
            Response.Success(this, result);

    }


}


router.get('/', main);
router.get('/:id', main);






module.exports = router;