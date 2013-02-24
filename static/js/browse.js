var libraries=getLibraries();

$(document).ready(function(){
  var items = $(".lib");
  items.each(function(i,lib){
    $(lib).click(function(){
      console.log(lib);
      if ($(lib).find(".extra_info").css("display")==="none"){
        $(lib).find(".extra_info").css("display","block");
      }
      else {
        $(lib).find(".extra_info").css("display","none");
      }
    });
  });
});