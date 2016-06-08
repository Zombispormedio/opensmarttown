var Router = require('koa-router');
var Boom = require("boom");


var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var TreeCtrl = require(C.ctrl + "tree")

const PREFIX="/tree"


const router = new Router({
  prefix: PREFIX
});

router.use(middleware.Developer());



router.get('/', function* () {
 var result = yield TreeCtrl.Get();
  Response.Success(this, result);
});



module.exports = router;