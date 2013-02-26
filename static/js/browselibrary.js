window.onload = function(){
  var url=window.location.href;
  var name=decodeURI(url.substring(url.indexOf("name")+5));
  getLibrary(name);
}


/* Given a library, updates the entire page */
function loadLibrary(library,disputes){
  $("#flow").html(library.name)
  $("#library_description").html(library.description);
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
      loadConflictDetails(parseInt($(conflict).attr("dispute_id")),disputes);
    })
  })
}

function createConflictLi(dispute,dispute_id){
  var li=$("<li>").attr("dispute_id",dispute_id);
  li.html(dispute[16]);
  return li;
}

function loadConflictDetails(dispute_id,disputes){
  $("#conflict-vs").css("display","block"); //someone changed style to none, change here programatically
  var currDispute=disputes[dispute_id];
  $("#conflict-name").html(currDispute[16]);
  $("#conflict-date").html(currDispute[4]+" - "+currDispute[7]);
  //allies and enemies
  var allies=$("#allies ul");
  allies.html("");
  currDispute[0].forEach(function(x){
    allies.append($("<li>").html(x));
  });

  var enemies=$("#enemies ul");
  enemies.html("");
  currDispute[1].forEach(function(x){
    enemies.append($("<li>").html(x));
  });

  $("#conflict-fatality").html("<h6>Fatality: </h6>"+fatalityString(parseInt(currDispute[10])));
  $("#conflict-hostility").html("<h6>Hostility: </h6>" + hostilityString(parseInt(currDispute[14])));
  /* Search google button appears only if the conflict is named */
  if(currDispute[16] !== undefined){
    $("#search-google").attr("onclick", "window.open('https://www.google.com/search?q="+currDispute[16]+"','_blank')")
    $("#search-google").attr("disabled", false);
  }
  else{
    $("#search-google").attr("disabled", true);
  }
}



function hostilityString(hostility_code){
  var hostility;  
  switch(hostility_code){
    /* There was a loss or a yield */ 
    case 1: hostility = "No militarized action"; break;
    case 2: hostility = "Threat to use force"; break;
    case 3: hostility = "Display of force" ; break;
    case 4: hostility = "Use of force"; break;
    case 5: hostility = "War"; break;
  }
  return hostility;
}

function fatalityString(fatality_code){
  var fatality;
  switch(fatality_code){
    /* There was a loss or a yield */ 
    case 0: fatality = "None"; break;
    case 1: fatality = "1-25 deaths"; break;
    case 2: fatality = "26-100 deaths"; break;
    case 3: fatality = "101-250 deaths"; break;
    case 4: fatality = "251-500 deaths"; break;
    case 5: fatality = "501-999 deaths"; break;
    case 6: fatality = ">999 deaths"; break;
    case -9: fatality = "Missing"; break;
  }
  return fatality;
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