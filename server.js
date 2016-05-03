var koa = require('koa');

var C = require("./config/main")
var routes = require(C.routes + "main")
var middleware = require(C.config+"middleware")

var app = koa();



middleware(app);

routes(app);


app.listen(C.port, function () {
    console.log("Connected: " + C.port);
    console.log("Init at: " + new Date());
});