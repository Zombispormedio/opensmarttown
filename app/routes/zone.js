var Router = require('koa-router');
var _ = require("lodash")
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

var main = function* () {
    var query = _.cloneDeep(this.query);
    var format = query.format;
    
    query.ref = this.params.id;
   
    if (query.near) {
        query.nearIDs = yield ZoneCtrl.NearIDs(query.near, query.max_distance);
    }


    switch (format) {
        case "kml":
            var result = yield ZoneCtrl.KML(query);
            Response.SuccessXML(this, result);

            break;
        case "geojson":
            var result = yield ZoneCtrl.GeoJSON(query);
            Response.SuccessGeoJSON(this, result);
            break;
        default:
            var result = yield ZoneCtrl.Default(query);
            Response.Success(this, result);

    }


}


router.get('/', main);
router.get('/:id', main);






module.exports = router;