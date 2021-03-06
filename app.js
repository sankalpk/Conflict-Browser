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
var libraries; //Object with library name as keys and an array of dispute ids as value

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

/*
//returns an array of objects of the form {"dispute_id": "1","allies":[USA,POL],"enemies":[RUS,BGR]}
app.get("/disputes/country/:ccode", function(request, response){
  var ccode=request.params.ccode;
  var arr=[]; 
  for(var key in disputes){
    var ally=0;
    var arr1=disputes[key][0];
    var arr2=disputes[key][1];
    //loop through both arrays to see if ccode is in there
    arr1.forEach(function(country){
      if(country===ccode) ally=1;
    });
    arr2.forEach(function(country){
      if(country===ccode) ally=2;
    });
    //if ccode is in there, add obj to array
    if (ally!=0){
      var obj = new Object();
      obj.dispute=disputes[key];
      if(ally===1) {obj.allies=arr1; obj.enemies=arr2;}
      else if(ally===2) {obj.allies=arr2; obj.enemies=arr1;}
      arr.push(obj);
    }
  }
  response.send({
    disputes: arr,
    success: true
  });
}); */

app.get("/disputes/country/:ccode", function(request, response){
  var ccode=request.params.ccode;
  var returnObj=new Object();
  var arr=[]; 
  for(var key in disputes){
    var ally=0; //if 0, country not involved, if 1=>arr1 is allies, if 2=>arr2 is allies
    var arr1=disputes[key][0];
    var arr2=disputes[key][1];
    //loop through both arrays to see if ccode is in there
    arr1.forEach(function(country){
      if(country===ccode) ally=1;
    });
    arr2.forEach(function(country){
      if(country===ccode) ally=2;
    });
    //if ccode is in there, add obj
    if (ally!=0){
      var obj = new Object();
      obj.dispute_id=key;
      obj.dispute=disputes[key];
      if(ally===1) {obj.allies=arr1; obj.enemies=arr2;}
      else if(ally===2) {obj.allies=arr2; obj.enemies=arr1;}
      //if year is not in return obj
      if(returnObj[disputes[key][4]]===undefined) {returnObj[disputes[key][4]]=[];}
      returnObj[disputes[key][4]].push(obj);
    }
  }
  response.send({
    disputes: returnObj,
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

  var conflicts={};
  if(libraries[name]!=undefined){
    libraries[name].disputes.forEach(function(x){
      conflicts[x]=(disputes[x]);
    });
  }
  response.send({
    library: libraries[name],
    disputes: conflicts,
    success:true
  });
});

app.get("/libraries/disputein/:name/:id",function(request, response){ //returns whether the dispute id is in the library
  var name=request.params.name;
  var id = request.params.id;
  var inArray=false;
  if(libraries[name] !== undefined && libraries[name].disputes !== undefined){
	  libraries[name].disputes.forEach(function(x){ //uses closures
	    if(x===id) inArray=true;
	  });
  }
  response.send({
    inArray: inArray,
    success:true
  });
});

app.post("/libraries", function(request, response) { //create a new library associated with "name"
  libraries[request.body.name]={
                  "name": request.body.name,
                  "disputes": [],
                  "description": request.body.description,
                  "date_modified": new Date(),
                  "date_added": new Date(),
                  "time_start": "N/A",
                  "time_end": "N/A",
                  "kudos":0
                  };
  writeFile("static/data/libraries.json", JSON.stringify(libraries));
  response.send({
    library: libraries[request.body.name],
    success: true
  });
});

app.put("/libraries/:name", function(request, response){//updates user library with new array of disputes or description
  var name=request.params.name;
  var oldItem=libraries[name];
  var libraryStartAndEnd = getStartAndEnd(oldItem);
  var library={ 
                "name": name,
                "disputes": JSON.parse(request.body.disputes), //an array of dispute ids
                "description": request.body.description,
                "date_modified": new Date(),
                "date_added": oldItem.date_added,
                "time_start": libraryStartAndEnd[0], //TODO write a function to calculate time range and change
                "time_end": libraryStartAndEnd[1],
                "kudos": oldItem.kudos
              };
  library.disputes = (library.disputes !== undefined) ? library.disputes : oldItem.disputes;
  library.description = (library.description !== undefined) ? library.description : oldItem.description;
  libraries[name]= library;
  writeFile("static/data/libraries.json", JSON.stringify(libraries));

  response.send({
    library: library,
    success: true
  });
});

app.put("/libraries/adddispute/:name", function(request, response){//updates user library with new array of disputes or description
  var name=request.params.name;
  var oldItem=libraries[name];
  oldItem.disputes.push(request.body.dispute);
  var libraryStartAndEnd = getStartAndEnd(oldItem);
  var library={ 
                "name": name,
                "disputes": oldItem.disputes, //an array of dispute ids
                "description": request.body.description,
                "date_modified": new Date(),
                "date_added": oldItem.date_added,
                "time_start": libraryStartAndEnd[0],
                "time_end": libraryStartAndEnd[1],
                "kudos": oldItem.kudos
              };
  library.disputes = (library.disputes !== undefined) ? library.disputes : oldItem.disputes;
  library.description = (library.description !== undefined) ? library.description : oldItem.description;
  libraries[name]= library;
  writeFile("static/data/libraries.json", JSON.stringify(libraries));

  response.send({
    library: library,
    success: true
  });
});


function getStartAndEnd(lib){
	var date_start = "N/A";
	var date_end = "N/A";
	
	for(var i=0; i<lib.disputes.length; i++){
		var id = lib.disputes[i];
		var dispute = disputes[id];
		if(dispute[4] < date_start || date_start === "N/A")
			date_start = dispute[4];
		if(dispute[7] > date_end  || date_end === "N/A")
			date_end = dispute[7];
	}
	
	return [date_start, date_end];
}


app.delete("/libraries/deldispute/:name", function(request, response){//updates user library with new array of disputes or description
  var name=request.params.name;
  var oldItem=libraries[name];
  var index = oldItem.disputes.indexOf(request.body.dispute);
  oldItem.disputes.splice(index, 1);
  //oldItem.disputes.push(request.body.dispute);
  var library={ 
                "name": name,
                "disputes": oldItem.disputes, //an array of dispute ids
                "description": request.body.description,
                "date_modified": new Date(),
                "date_added": oldItem.date_added,
                "time_start": -1, //TODO write a function to calculate time range and change
                "time_end": -1,
                "kudos": oldItem.kudos
              };
  library.disputes = (library.disputes !== undefined) ? library.disputes : oldItem.disputes;
  library.description = (library.description !== undefined) ? library.description : oldItem.description;
  libraries[name]= library;
  writeFile("static/data/libraries.json", JSON.stringify(libraries));

  response.send({
    library: library,
    success: true
  });
});

app.put("/libraries/:name/kudos", function(request, response){ //give kudos to a library
  var name=request.params.name;
  libraries[name].kudos+=1;
  writeFile("static/data/libraries.json", JSON.stringify(libraries));

  response.send({
    library: libraries[name],
    success:true
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

app.delete("/libraries/:name", function(request, response){ //deletes a library by name
  delete libraries[request.params.name];
  writeFile("libraries.json", JSON.stringify(libraries));
  response.send({
    libraries: libraries,
    success: true
  });
});

//COORDINATES
app.get("/coordinates",function(request, response){
  response.send({
    coordinates: coordinates,
    success: true
  });
});


app.get("/coordinates/:ccode", function(request, response){
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


function initServer() { //TODO: Double check piazza to see if this is how we should read multiple files
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
