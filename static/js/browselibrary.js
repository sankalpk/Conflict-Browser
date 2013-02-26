window.onload = function(){
  var url=window.location.href;
  var name=decodeURI(url.substring(url.indexOf("name")+5));
  getLibrary(name);
}


/* Given a library, updates the entire page */
function loadLibrary(library,disputes){
  loadConflicts(disputes);
}

function loadConflicts(disputes){
  var ul=$("<ul>");
  for (var id in disputes){
    ul.append(createConflictLi(disputes[id],id));
  }
  $("#conflict-list").append(ul);
  addClickToAllConflicts(disputes);
}

function addClickToAllConflicts(disputes){
  var conflicts=$("#conflict-list li");
  conflicts.each(function(i,conflict){
    $(conflict).click(function(){
      loadConflictDetails(conflict,disputes);
    })
  })
}

function createConflictLi(dispute,dispute_id){
  var li=$("<li>").attr("dispute_id",dispute_id);
  li.html(dispute[16]);
  return li;
}

function loadConflictDetails(dispute_id,disputes){
  console.log(dispute_id,disputes);

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