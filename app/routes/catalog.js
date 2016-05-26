var Router = require('koa-router');
var Boom = require("boom");

var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var router = new Router({
  prefix: '/catalog'
});

router.use(middleware.Developer());


router.get('/', function* () {
  Response.Success(this, i18n.M.welcome_users);
});



module.exports=router;