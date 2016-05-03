var C = require("../../config/main")

var users = require(C.routes + "users_routes")

module.exports = function (app) {


    app.use(users.routes())
       .use(users.allowedMethods());




}