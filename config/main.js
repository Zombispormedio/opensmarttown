var path = require("path"),
    rootPath = path.normalize(__dirname + "/..");

var rootfunc = function (basename) {
    return path.normalize(rootPath+"/"+basename);
};

var rootSpecialfunc = function (basename) {
    return path.normalize("/"+basename);
};

var secure = function (value) {
    return { writable: false, configurable: true, value: value };
};

var secure_path=function(basename){
    return secure(rootfunc(basename));
};

var secure_special_path=function(basename){
    return secure(rootSpecialfunc(basename));
};

var Config = Object.create(null);
Config.prototype = {};
var config = Object.create(Config.prototype, {
    db: secure(process.env.SMART_DB_URL),
    redis_host: secure(process.env.REDIS_HOST),
    redis_port: secure(process.env.REDIS_PORT),
    root: secure(rootPath),
    config: secure_path("config/"),
    routes: secure_path("app/routes/"),
    lib:secure_path("app/lib/"),
    resource:secure_path("app/resource/"),
    models:secure_path("app/models/"),
    temp:secure_special_path("temp/"),
    test:secure_path("test/"),
    ctrl:secure_path("app/ctrl/"),
    templates:secure_path("app/templates/"),
    secret:secure(process.env.SMARTDBSECRET),
    lang:secure("ES"),
    pagination:secure(5),
    port: secure(process.env.PORT || 5090)
});



module.exports = config;
