var express = require('express'),
  routes = require('./routes'),
  socket = require('./routes/socket.js');

var app = module.exports = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(require('connect-assets')());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/',routes.index);
app.get('*', routes.index);

server = app.listen(3000);

var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);
