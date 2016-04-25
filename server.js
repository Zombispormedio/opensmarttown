var restify = require('restify');
var server = restify.createServer({
  name: 'smart-town-api',
  version: '1.0.0'
});
var port = process.env.PORT || 5090;

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());

server.get('/', function (req, res) {
  res.send('Welcome');

});

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
