// super-todo version of simpleExpressServer.js
// A simple RESTful Express server for 15-237.

var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

var disputes;
var coordinates;
var libraries; //Hash of usernames as keys and an array of dispute id as value

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}

// DISPUTES
app.get("/disputes",function(request, response){
  response.send({
    disputes: disputes,
    success: true
  });
});

app.get("/disputes/:id",function(request, response){
  var id=request.params.id;
  response.send({
    dispute:disputes["\""+id+"\""],
    success: true
  });
});



//LIBRARIES
app.get("/libraries",function(request, response){ //get all libraries
  response.send({
    libraries: libraries,
    success: true
  });
});

app.get("/libraries/:name",function(request,response){ //get one library by name
  var name=request.params.name;
  response.send({
    library: libraries[name],
    success:true
  });
});

app.post("/libraries", function(request, response) { //create a new library associated with "name"
  libraries[request.body.name]={
                  "disputes": [],
                  "description": request.body.description,
                  "date_modified": new Date(),
                  "date_added": new Date(),
                  "time_start": -1,
                  "time_end": -1
                  };
  writeFile("libraries.json", JSON.stringify(libraries));
  response.send({
    library: libraries[request.body.name],
    success: true
  });
});

app.put("/libraries/:name", function(request, response){//updates user library with new array of disputes
  var name=request.params.name;
  var oldItem=libraries[name];
  var library={ "disputes": JSON.parse(request.body.disputes), //an array of dispute ids
                "description": request.body.description,
                "date_modified": new Date(),
                "time_start": -1, //TODO write a function to calculate and change
                "time_end": -1
              };
  library.disputes = (library.disputes !== undefined) ? library.disputes : oldItem.disputes;
  library.description = (library.description !== undefined) ? library.description : oldItem.description;
  libraries[name]= library;
  writeFile("libraries.json", JSON.stringify(libraries));

  response.send({
    library: library,
    success: true
  });
});

app.delete("/libraries", function(request, response){ //deletes all libraries
  libraries={};
  writeFile("libraries.json", JSON.stringify(libraries));
  response.send({
    libraries: libraries,
    success: true
  });
});

app.delete("libraries/:name", function(request, response){ //deletes a library by name
  delete[request.params.name];
  writeFile("libraries.json", JSON.stringify(libraries));
  response.send({
    libraries: libraries,
    success: true
  });
});


//COORDINATES
app.get("/coordinates",function(){
  response.send({
    coordinates: coordinates,
    success: true
  });
});

app.get("/coordinates/:ccode", function(){
  var ccode=request.params.ccode; //by ISO3 country code, i.e. United Staes is USA
  response.send({
    coordinate: coordinates[ccode],
    success: true
  });
})




// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// This is for serving files in the images directory
app.get("/static/images/:staticFilename", function (request, response) {
    response.sendfile("static/images/" + request.params.staticFilename);
});

// This is for serving files in js directory
app.get("/static/js/:staticFilename", function (request, response) {
    response.sendfile("static/js/" + request.params.staticFilename);
});

// This is for serving files in stylesheets directory
app.get("/static/stylesheets/:staticFilename", function (request, response) {
    response.sendfile("static/stylesheets/" + request.params.staticFilename);
});

// This is for serving files in data directory
app.get("/static/data/:staticFilename", function (request, response) {
    response.sendfile("static/data/" + request.params.staticFilename);
});


function initServer() {
  // When we start the server, we must load the stored data
  var defaultHash = "{}";
  readFile("static/data/disputes.json", defaultHash, function(err, data) {
    disputes = JSON.parse(data);
  });
  readFile("static/data/coordinates.json", defaultHash, function(err, data) {
    coordinates = JSON.parse(data);
  });
  readFile("static/data/libraries.json", defaultHash, function(err, data){
    libraries=JSON.parse(data);
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
