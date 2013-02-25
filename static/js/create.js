/* Canvas elements */
var map_canvas, timeline_canvas;
var map_context, timeline_context;

/* Start and end dates currently selected */
var x_start, x_end;
var date_start, date_end;

var x_end_max = 585;
var x_start_min = 10;

/* The reference country and its dispute data */
var ccode;
var disputes;
var disputes_per_year = {};
var max_disputes_in_year = 0;

/* For timeline interactions */
var drag_start = false;
var drag_end = false;


window.onload = function(){

	timeline_canvas = document.getElementById("timeline");
	timeline_context = timeline_canvas.getContext("2d");
  
  	map_canvas = document.getElementById("map");
  	map_context = map_canvas.getContext("2d");
  	
  	/* Draw the timeline */
  	date_start = x_start_min; 
  	date_end = x_end_max;
  	drawTimeline(date_start, date_end);
  	setTimelineInteractions();

  	/* Draw the map */  	
  	map = new Image();
  	map.onload = function(){
  		map_context.drawImage(map, 0, 0);
  	};
  	map.src = "images/world.75.png";
  	
  	/* Populate the search */
	$.ajax({
		type: "get",
		url: "/coordinates",
		success: function(data) {
			var coordinates = data.coordinates;
			var sel = $("#country-input");
			sel.change(updateWithCountry());
			for(var country_code in coordinates){
				var opt = $("<option>");
				opt.attr("value", country_code);
				opt.html(coordinates[country_code][0]);
				sel.append(opt);
			}
		}
	});	

}


/* Given a new country, updates the enire page */
function updateWithCountry(country_code){
	return function(){
	
		/* Get the selected country code */
		ccode = $("#country-input option:selected")[0].value;
		
		/* Make sure we were able to get the country code */
		if(ccode === undefined || ccode.length !== 3){
			/* TODO: Update timeline and map to be blank */
			return;
		}
				
		/* Get the conflicts for the country */
		$.ajax({
			type: "get",
			url: "/disputes/country/"+ccode,
			success: function(data){
				disputes = data.disputes;
				
				/* Update disputes per year */
				for(var i=1812; i<1993; i++){
					disputes_per_year[i+""] = 0;
				}
				
				for(var year in disputes){
					for(var i = 0; i<disputes[year].length; i++){
						var start = parseInt(disputes[year][i].dispute[4]);
						var end = parseInt(disputes[year][i].dispute[7]);
						
						for(var j=start; j<end; j++){
							disputes_per_year[j+""]++;
						}
					}
				}
				
				/* Update the maximum number of disputes found */
				max_disputes_in_year = 0;
				for(var i=1812; i<1993; i++){
					var num_disp = disputes_per_year[i+""];
					if(num_disp > max_disputes_in_year)
						max_disputes_in_year = num_disp;
				}
				
				
				/* Update the timeline */
				drawTimeline(date_start, date_end);
				
				/* Update the conflict DOM */
				
				/* Update the map */
				
			}
		});
	};
}


/* Draws the unpopulated timeline on the timeline canvas */
function drawTimeline(slider_start, slider_end){

	
	/* Clear the context */
	timeline_context.clearRect(0,0, timeline_canvas.width, timeline_canvas.height);

	timeline_context.fillStyle = "#FFFBF4";
	timeline_context.fillRect(0,0,timeline_context.width, timeline_context.height);
	
	
	/* Timeline highlight */
	timeline_context.fillStyle = "rgba(240, 150, 150, .1);"
	timeline_context.fillRect(slider_start,0, slider_end-slider_start, 70);
		
	/* Timeline axis */
	timeline_context.fillStyle = "#777";
	timeline_context.font = "bold 12pt Helvetica"
	timeline_context.fillText("1816",0,95);
	timeline_context.fillText("1992", 555, 95);	
	
	/* Timeline line */
	timeline_context.fillStyle = "#EEE";
	timeline_context.strokeStyle = "#777";
	timeline_context.lineWidth = 1;
	timeline_context.fillRect(10, 70, 580, 5);
	timeline_context.strokeRect(10, 70, 580, 5);
	
	/* TODO: Timeline data */
	if(disputes_per_year !== undefined){
		timeline_context.fillStyle = "rgba(240, 150, 150, 1);"
		var bar_width = yearsTotimelinePixels(1);
		var bar_inc = 65/max_disputes_in_year;
		for(var year in disputes_per_year){
			if(disputes_per_year[year]>0){
				timeline_context.fillRect(
					yearTotimelinePixels(parseInt(year)), 
					70-(bar_inc*disputes_per_year[year]), 
					bar_width, 
					bar_inc*disputes_per_year[year]);
			}
		}
	}
	
	/* Timeline sliders */
	timeline_context.fillStyle = "#866";
	timeline_context.arc(slider_start, 70, 10, 0, 2*Math.PI, false);
	timeline_context.fill();
	
	timeline_context.fillStyle = "#866";
	timeline_context.arc(slider_end, 70, 10, 0, 2*Math.PI, false);
	timeline_context.fill();

	
	/* Timeline vertical bar */
	timeline_context.strokeStyle = "#FAA";
	timeline_context.beginPath();
	timeline_context.moveTo(slider_start, 0);
	timeline_context.lineTo(slider_start, 60);
	timeline_context.stroke();
	timeline_context.closePath();
	
	timeline_context.beginPath();
	timeline_context.moveTo(slider_end, 0);
	timeline_context.lineTo(slider_end, 60);
	timeline_context.stroke();	
	timeline_context.closePath();
	
	timeline_context.fillStyle = "#777";
	timeline_context.font = "bold 10pt Helvetica"
	timeline_context.fillText("" + timelinePixelToYear(slider_start), slider_start, 10);
	timeline_context.fillText("" + timelinePixelToYear(slider_end), slider_end-30, 10);

}




function setTimelineInteractions(){
       
	timeline_canvas.addEventListener("mousedown", function(ev){
		var x = event.pageX - timeline_canvas.offsetLeft;
		var y = event.pageY - timeline_canvas.offsetTop;
		if(y>60 && y<80){
			if(x<date_start+10 && x>date_start-10){
				console.log("moving start");
				drag_start = true;
			}
			else if(x<date_end+10 && x>date_end-10){
				console.log("moving end");
				drag_end = true;
			}
		}

	}, false);

	/* */
	timeline_canvas.addEventListener("mousemove", function(ev){
		var x = event.pageX - timeline_canvas.offsetLeft;

		if(drag_start && (timelinePixelToYear(date_end)-timelinePixelToYear(x) >= 20) && (x>x_start_min)){
			/* Redraw the timeline */
			drawTimeline(x, date_end);
			date_start = x;
			
			/* Redraw conflicts list */
			
			/* Redraw the map */
			
		}
		
		else if(drag_end && (timelinePixelToYear(x)-timelinePixelToYear(date_start) >= 20) && (x<x_end_max)){
			drawTimeline(date_start, x);
			date_end = x;
			
			/* Redraw conflicts list */
			
			/* Redraw the map */
		}
		
	}, false);
	
	timeline_canvas.addEventListener("mouseup", function(ev){
		drag_start = false;
		drag_end = false;
	}, false);

}


function timelinePixelToYear(pixel){
	return 1816 + Math.round(176*(pixel-10)/575);
}

function yearsTotimelinePixels(years){
	return Math.round(years*575/176);
}

function yearTotimelinePixels(year){
	return 10 + Math.round((year-1816)*575/176);
}