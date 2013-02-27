$(document).ready(function(){
  var url=window.location.href;
  var host=url.substring(0,url.indexOf("/static"));
  var name=decodeURI(url.substring(url.indexOf("name")+5));
  addShareLink(name,host);
  addButtonLink(name, host);
  changeHeading(name);
});

function addShareLink(name,host){
  $("#shareURL").attr("value",host+"/static/browselibrary.html?name="+encodeURI(name));
}

function addButtonLink(name, host){
  var a=$("#share");
  a.attr("href",host+"/static/browselibrary.html?name="+name);
}

function changeHeading(name){
  var flow=$("#flow").html(name);
}