var Router = require('koa-router');
var _ = require("lodash")

var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var CurrentCtrl = require(C.ctrl + "current")
var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var SensorCtrl = require(C.ctrl + "sensor")
const PREFIX = "/current"


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

    if (query.near) {
        query.nearGridIDs = yield SensorGridCtrl.NearIDs(query.near, query.max_distance);
    }

    var result = yield CurrentCtrl.GetSensorData(query);
    Response.Success(this, result);
}
router.get('/', main);
router.get('/:sensor', main);



module.exports = router;