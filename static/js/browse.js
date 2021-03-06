var libraries;

$(document).ready(function(){
  getLibraries();
});

function hideExtraInfo(){
  var items = $(".lib");
  items.each(function(i,lib){
    $(lib).find(".name").click(function(){
      if ($(lib).find(".extra_info").css("display")==="none"){
        $(lib).find(".extra_info").css("display","block");
      }
      else {
        $(lib).find(".extra_info").css("display","none");
      }
    });

  });
}

function getLibraries(){
  $.ajax({
    type: "get",
    url: "/libraries",
    success: function(data) {
      libraries = data.libraries;
      createLibrariesHTML();
    }
  });
}

function createLibrariesHTML(){
  var ul=$("<ul>");
  for(var key in libraries){
    var lib=$("<li>").addClass("lib").html(createLibraryView(key));
    ul.append(lib);
  }
  $("#content").append(ul);
  hideExtraInfo();
}

function createLibraryView(key){
  var library=libraries[key];
  var ul=$("<ul>");
  var name=$("<li>").addClass("name").html(key);
  var date_modified=$("<li>").addClass("date_modified").html("<div>Created</div>"+library.date_modified.slice(5,10)+"-"+library.date_modified.slice(0,4));
  var extra_info=$("<div>").addClass("extra_info");
  var description=$("<li>").addClass("description").html("<h1>Description</h1><p>"+library.description+"</p>");
  var dates=$("<div>").addClass("dates");
  var date_started=$("<li>").addClass("date_started").html("<h1>Date Started</h1><p>"+library.time_start+"</p>");
  var date_ended=$("<li>").addClass("date_ended").html("<h1>Date Ended</h1><p>"+library.time_end+"</p>");
  var buttons=$("<div>").addClass("buttons");
  var view_lib=$("<a>").attr("href",'/static/browselibrary.html?name='+encodeURI(key)).append($("<li>").addClass("view_lib button").html("View Library"));
  var download_json=$("<a>").attr("href",'/libraries/'+encodeURI(key)).append($("<li>").addClass("download_json button").html("Download JSON"));
  ul.append(name,date_modified,extra_info);
  extra_info.append(description,dates,buttons);
  dates.append(date_started,date_ended);
  buttons.append(view_lib,download_json);
  return ul;
}