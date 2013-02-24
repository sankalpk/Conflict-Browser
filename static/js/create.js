/* Canvas contexts */
var map_context, timeline_context;

/* Start and end dates currently selected */
var date_start, date_end;

/* The reference country */
var country;
var conflicts;

window.onload = function(){
	timeline_context = document.getElementById("timeline").getContext("2d");

	/* Draw the timeline */
  	drawTimeline();
  
  	/* Draw the map */
  	map_context = document.getElementById("map").getContext("2d");
  	map = new Image();
  	map.onload = function(){
  		map_context.drawImage(map, 0, 0);
  	};
  	map.src = "images/world.75.png";
}

/* Draws the unpopulated timeline on the timeline canvas */
function drawTimeline(){

	var slider_start = 10;
	var slider_end = 500;

	timeline_context.fillStyle = "#FFFBF4";
	timeline_context.fillRect(0,0,timeline_context.width, timeline_context.height);
	
	
	/* Timeline highlight */
	timeline_context.fillStyle = "rgba(240, 150, 150, .1);"
	timeline_context.fillRect(slider_start,0, slider_end-slider_start, 70);
		
	/* Timeline axis */
	timeline_context.fillStyle = "#000";
	timeline_context.fillText("1816",0,0);
	
	
	/* Timeline line */
	timeline_context.fillStyle = "#EEE";
	timeline_context.strokeStyle = "#777";
	timeline_context.lineWidth = 1;
	timeline_context.fillRect(10, 70, 580, 5);
	timeline_context.strokeRect(10, 70, 580, 5);
	
	/* TODO: Timeline data */
	
	
	/* Timeline sliders */
	timeline_context.fillStyle = "#866";
	timeline_context.arc(slider_start, 70, 10, 0, 2*Math.PI, false);
	timeline_context.fill();
	
	timeline_context.fillStyle = "#866";
	timeline_context.arc(500, 70, 10, 0, 2*Math.PI, false);
	timeline_context.fill();

	
	/* Timeline vertical bar */
	timeline_context.strokeStyle = "#FAA";
	timeline_context.beginPath();
	timeline_context.moveTo(slider_start, 0);
	timeline_context.lineTo(slider_start, 60);
	timeline_context.stroke();

	timeline_context.beginPath();
	timeline_context.moveTo(slider_end, 0);
	timeline_context.lineTo(slider_end, 60);
	timeline_context.stroke();	

}