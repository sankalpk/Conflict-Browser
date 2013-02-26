$(document).ready(function(){
  var url=window.location.href;
  var host=url.substring(0,url.indexOf("/static"));
  var name=(url.substring(url.indexOf("name")+5));
  addShareLink(name,host);
  addButtonLink(name, host);
  changeHeading(name);
});

function addShareLink(name,host){
  $("#shareURL").attr("value",host+"/static/browselibrary.html?name="+name);
}

function addButtonLink(name, host){
  button=$("#share");
  html=button.html();
  button.html("<a href="+host+"/static/browselibrary.html?name="+name+">"+html+"</a>");
}

function changeHeading(name){

}