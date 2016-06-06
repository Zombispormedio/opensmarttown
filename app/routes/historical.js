var Router = require('koa-router');
var _ = require("lodash")

var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var HistoricalCtrl = require(C.ctrl + "historical")
var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var SensorCtrl = require(C.ctrl + "sensor")
const PREFIX = "/historical"


const router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {
    var query = _.cloneDeep(this.query);

    query.ref = this.params.sensor;

    if (query.magnitude) {
        query.magnitudeIDs = yield SensorCtrl.MagnitudeIDs(query.magnitude);
    }

    if (query.grid) {

        query.SensorIDsByGrid = yield SensorCtrl.SensorIDsByGrid(query.grid);

    }
    
     if (query.zone) {

        query.SensorIDsByZone = yield SensorCtrl.SensorIDsByZone(query.zone);
      
    }

    if (query.near) {
        query.nearGridIDs = yield SensorGridCtrl.NearIDs(query.near, query.max_distance);
    }

    var result = yield HistoricalCtrl.GetHistorical(query);
    Response.Success(this, result);
}
router.get('/', main);
router.get('/:sensor', main);



module.exports = router;