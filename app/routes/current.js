var Router = require('koa-router');
var _ = require("lodash")

var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var CurrentCtrl = require(C.ctrl + "current")

const PREFIX = "/current"


const router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

var main=function* () {
    var query = _.cloneDeep(this.query);

    query.ref = this.params.sensor;

    var result = yield CurrentCtrl.GetSensorData(query);
    Response.Success(this, result);
}
router.get('/', main);
router.get('/:sensor', main);



module.exports = router;