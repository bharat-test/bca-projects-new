var express = require("express");
var fs = require("fs");
var https = require("https");
var path = require('path');
var app = express();

app.get("/", function (req, res) {
    var options = {
        root: path.join(__dirname)
    };
    var fileName = 'index.html';
  res.sendFile(fileName,options);
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  )
  .listen(5555, function () {
    console.log(
      "Example app listening on port 5555! Go to https://localhost:5555/"
    );
  });
