/*
A simple node server to
send all HTML request to --> index.html
handle all other static asset requests
*/

// Imports
var express = require("express");
var app = express();
var path = require("path");


// Variables
const port = process.env.PORT || 5000;
const googleForm = "https://docs.google.com/forms/d/e/1FAIpQLSeHWQDnA1ycEoDlJQXIz48sPoac-q5QlRo2Dyznu5E2ixYeGg/viewform";


// Map all static asset requests to their respective locations in /dist
app.use(express.static(__dirname + "/dist"));

// Send request to /form to Google form
app.get("/form", function(req, res) {
  res.redirect(googleForm);
});

// Send all HTML requests to index.html for client side JS framework to handle.
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

// RUN IT :D
var server = app.listen(port, function () {
   const port = server.address().port;
   console.log("Listening on port: %s", port);
});
