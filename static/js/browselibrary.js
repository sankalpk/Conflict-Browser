var library;
var disputes;

window.onload = function(){
  var url=window.location.href;
  var name=decodeURI(url.substring(url.indexOf("name")+5));
  console.log(name);
  //getLibrary(name);
}


/* Given a library, updates the entire page */
function loadLibrary(library,disputes){
  loadConflicts(disputes);
}

function loadConflicts(disputes){
  var ul=$("<ul>");
  for (var id in disputes){
    ul.append(createConflictLi(disputes[id]));
  }
  $("#conflict-list").append(ul);
  addClickToAllConflicts();
}

function addClickToAllConflicts(){
  $("#conflict-list li").click(function(){
    console.log(this);
  })
}

function createConflictLi(dispute,dispute_id){
  var li=$("<li>");
  li.html(dispute[16]);
  return li;
}

function loadConflictDetails(dispute){

}

function getLibrary(name){
  $.ajax({
    type: "get",
    url: "/libraries/"+name,
    success: function(data) {
      loadLibrary(data.library,data.disputes);
    }
  });
}