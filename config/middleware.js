var C = require("./main")
var use = require('koa-use');
var methodOverride = require('koa-methodoverride');
var compress = require('koa-compress')
var cors = require('koa-cors');
var bodyParser = require('koa-bodyparser');
var health = require('koa-ping');
var morgan = require('koa-morgan');
var errorHandler = require('koa-errorhandler')
var cache = require('koa-cache-lite');

module.exports = function (koa) {
    var app = use(koa);

    cache.configure({
        '/': 3000
    }, {
            external: {
                type: 'redis',
                host: C.redis_host,
                port: C.redis_port
            },
            debug: true
        })


    app.use([
        morgan.middleware("dev"),
        methodOverride(),
        cache.middleware(),
        compress(),
        cors(),
        bodyParser(),
        health(),
        errorHandler()
    ]);


}