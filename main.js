var express = require("express");
var app = express();

app.set('port', (process.env.PORT || 5000));

// Serve out of this directory
var distDir = __dirname + "/";
app.use(express.static(distDir));

// GET / --> Serve the index page
app.get('/', function(request, response){
  response.render('index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
