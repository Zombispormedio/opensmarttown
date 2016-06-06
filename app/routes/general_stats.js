var Router = require('koa-router');


var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var GeneralCtrl = require(C.ctrl + "general_stats")

var middleware = require(C.routes + "middleware")

const PREFIX = '/general_stats';


var router = new Router({
  prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {

  var result = yield GeneralCtrl.Get();
  Response.Success(this, result);
}

router.get('/', main);

router.get('/:id', main);






module.exports = router;