var disputes = undefined;
var coordinates = undefined;
var libraries = undefined;

//Ajax methods
function getDisputes(){
  $.ajax({
    type: "get",
    url: "/disputes",
    success: function(data) {
      //disputes = data.disputes;
    }
  });
}

function getCoordinates(){
  $.ajax({
    type: "get",
    url: "/coordinates",
    success: function(data) {
      coordinates = data.coordinates;
      
    }
  });
}

function getLibraries(){
  $.ajax({
    type: "get",
    url: "/libraries",
    success: function(data) {
      libraries = data.libraries;
    }
  });
}

function getDisputesByCountry(ccode){
  $.ajax({
    type: "get",
    url: "/disputes/country/"+ccode,
    success: function(data){
    	disputes = data.disputes;
     }
  });
}