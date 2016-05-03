var koa=require('koa');

var port = process.env.PORT || 5090;
var app = koa();


app.use(function *() {
    this.body='Hello World';
});


app.listen(port);