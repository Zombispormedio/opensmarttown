var Router = require('koa-router');
var Boom = require("boom");

var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var DeveloperCtrl = require(C.ctrl + "developer")

var middleware = require(C.routes + "middleware")


var router = new Router({
  prefix: '/users'
});


router.get('/', function* () {
  Response.Success(this, i18n.M.welcome_users);
});

router.post('/', middleware.Body(), function* () {
  var result = yield DeveloperCtrl.signin(this.request.body);
  Response.Success(this, result);
});




module.exports = router;




