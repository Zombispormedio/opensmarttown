var Router = require('koa-router');


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


router.get('/:sensor', function* () {

   
    var result = yield CurrentCtrl.GetSensorData(this.params.sensor);
    Response.Success(this, result);
});



module.exports = router;