var Router = require('koa-router');


var router = new Router({
  prefix: '/users'
});

router.get('/', function *() {
     this.body = 'Hello World';
});

module.exports=router;




