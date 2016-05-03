var koa = require('koa');

var C = require("./config/main")
var Log = require(C.lib + "logger")
var Routes = require(C.routes + "main")
var Middleware = require(C.config + "middleware")
var ConnectDB = require(C.config + "database.js");

var app = koa();

Middleware(app);

Routes(app);

var Server = function () {
    app.listen(C.port, function () {
       Log.info("Server Connected", {port: C.port, date: new Date()});
      
    });
}

ConnectDB(Server);


