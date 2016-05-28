var Router = require('koa-router');


var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var MagnitudeCtrl = require(C.ctrl + "magnitude")

var middleware = require(C.routes + "middleware")

const PREFIX = '/magnitudes';


var router = new Router({
  prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {
  this.query.ref = this.params.id;
  var result = yield MagnitudeCtrl.Get(this.query);
  Response.Success(this, result);
}

router.get('/', main);

router.get('/:id', main);






module.exports = router;