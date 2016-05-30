var Router = require('koa-router');
var Boom = require("boom");
var path=require("path");

var C = require("../../config/main")
var Response = require(C.lib + "response")
var middleware = require(C.routes + "middleware")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")
var Error = require(C.lib + "error")

const PREFIX="/catalog"


const router = new Router({
  prefix: PREFIX
});

router.use(middleware.Developer());

const Catalog = [
  "magnitudes",
  "zones",
  "sensor_grids",
  "sensors",
  "current",
  "historical"

]

router.get('/', function* () {

  Response.Success(this, Catalog);
});



module.exports = router;