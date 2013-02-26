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

/* Map between country codes, coordinates, and pixels on the map */
var coordinates;

/* The current libarary we are adding to */
var lib;


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
  	var map = new Image();
  	map.onload = function(){
  		map_context.drawImage(map, 0, 0);
  	};
  	map.src = "images/world.75.png";
  	
  	/* Populate the search */
	$.ajax({
		type: "get",
		url: "/coordinates",
		success: function(data) {
			coordinates = data.coordinates;
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


function createLibrary(){
	console.log("HERE");
	$.ajax({
		type: "get",
		url: "/libraries/"+$("#libname").val(),
		success: function(data){
			console.log(data.library);
			//Unique library
			if(data.success && data.library === undefined){
				$.ajax({
					type: "post",
					url: "/libraries",
					data: {"name": $("#libname").val(), "description": $("#libdesc").val()},
					success: function(data){
						console.log("successfully added");
						lib = data.library;
						
						/* Go to next create phase */
						$(".create-1").css("display", "none");
						$(".create-2").css("display", "block");
					}
				});
			}
			//It already exists
			else{
				$("#form-err").html("Sorry, a library with that name already exists");
			}
		}
	});
	
	return false;
}


/* Given a new country, updates the enire page */
function updateWithCountry(){
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
				updateConflicts();
				
				/* Update the map */
				updateMap();
			}
		});
	};
}


/* Updates conflict information with the given start and end date */
function updateConflicts(){
	/* Remove children */
	var ul = $("#conflict-list ul");
	ul.html("");
	
	var start_yr = timelinePixelToYear(date_start);
	var end_yr = timelinePixelToYear(date_end);

	
	/* Create and add new children */
	for(var year in disputes){
		if(parseInt(year) < start_yr || parseInt(year) > end_yr)
			continue;
		for(var i = 0; i<disputes[year].length; i++){
			var li = $("<li>");
			
			li.attr("onclick", "updateDetails("+year+","+i+")");
			
			if(disputes[year][i].dispute[16] !== undefined)
				li.html(disputes[year][i].dispute[16]);
			else
				li.html("Unnamed Conflict of " + year);
			
			ul.append(li);
		}
	}
}

function updateDetails(year, i){
	var d = disputes[year][i];
	
	if(d.dispute[16] !== undefined)
		$("#conflict-name").html(d.dispute[16]);
	else
		$("#conflict-name").html("Unnamed Conflict");	
	$("#conflict-date").html(d.dispute[4] + " - " + d.dispute[7]);
	
	var allies = $("#conflict-vs #allies ul");
	allies.html("");
	for(var i=0; i<d["allies"].length; i++){
		var li = $("<li>");
		li.html(d["allies"][i]);
		allies.append(li);
	}
	
	var enemies = $("#conflict-vs #enemies ul");
	enemies.html("");
	for(var i=0; i<d["enemies"].length; i++){
		var li = $("<li>");
		li.html(d["enemies"][i]);
		enemies.append(li);
	}
	
	$("#conflict-vs").css("display", "block");
	
	var outcome_code = parseInt(d.dispute[8]);
	var outcome;
	console.log(d);
	console.log(outcome_code);
	switch(outcome_code){
		/* There was a loss or a yield */
		case 1:
		case 2:
		case 3:
		case 4: 		
			if(outcome_code%2 == 1){
				if($.inArray(ccode, d.dispute[0]) > -1)
					outcome = "Allied";
				else
					outcome = "Enemy"
					
				if(outcome_code > 2)
					outcome += " Yield";
				else
					outcome += " Victory";
			}
			else{
				if($.inArray(ccode, d.dispute[1]) > -1)
					outcome = "Allied";
				else
					outcome = "Enemy"
				
				if(outcome_code > 2)
					outcome += " Yield";
				else
					outcome += " Victory";
			}
			break;
		
		case 5: outcome = "Stalemate"; break;
		case 6: outcome = "Compromise"; break;
		case 7: outcome = "Released"; break;
		case 8: outcome = "Unclear"; break;
		case 9: outcome = "Joins ongoing war"; break;
		case -9: outcome = "Missing"; break;
	}
	$("#conflict-outcome").html("<h6>Outcome: </h6>" + outcome);
	
	
	var fatality_code = parseInt(d.dispute[10]);
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
	$("#conflict-fatality").html("<h6>Fatality Count: </h6>" + fatality);


	var hostility_code = parseInt(d.dispute[14]);
	var hostility;	
	switch(hostility_code){
		/* There was a loss or a yield */	
		case 1: hostility = "No militarized action"; break;
		case 2: hostility = "Threat to use force"; break;
		case 3: hostility = "Display of force" ; break;
		case 4: hostility = "Use of force"; break;
		case 5: hostility = "War"; break;
	}
	$("#conflict-hostility").html("<h6>Hostility: </h6>" + hostility);

	/* Search google button appears only if the conflict is named */
	if(d.dispute[16] !== undefined){
		$("#search-google").attr("onclick", "window.open('https://www.google.com/search?q="+d.dispute[16]+"','_blank')")
		$("#search-google").attr("disabled", false);
	}
	else{
		$("#search-google").attr("disabled", true);
	}
	
	/* Add to library button is only enabled if the conflict isn't in the library */
	$("#add-to-lib").attr("disabled", true);
	if(lib !== undefined){
		$.ajax({
		    type: "get",
		    url: "/disputes/disputein/"+lib+"/"+ccode,
		    success: function(data){
		    	if(data.success && !data.inArray){
			    	$("#add-to-lib").attr("disabled", false);
			    }
		    }
	    });
    }
}

function updateMap(){
	/* Clear the map */
	map_context.clearRect(0,0, map_canvas.width, map_canvas.height);
 
	/* Redraw the background */
	var map = new Image();
  	map.onload = function(){
	  	map_context.drawImage(map, 0, 0);
	  	
	  	/* Redraw map with conflicts in time range */
		var start_yr = timelinePixelToYear(date_start);
		var end_yr = timelinePixelToYear(date_end);
		
		for(var year in disputes){
			if(parseInt(year) < start_yr || parseInt(year) > end_yr)
				continue;
			
			for(var i = 0; i<disputes[year].length; i++){
				/* Draw allies */
				var allies = disputes[year][i].allies;
				map_context.fillStyle = "rgba(50,50,250,.2)";
				for(var j=0; j<allies.length; j++){
					if (allies[j] !== ccode && coordinates[allies[j]]!==undefined){
						var x = coordinates[allies[j]][3].x *.75 -70;
						var y = coordinates[allies[j]][3].y *.75 -50;
						map_context.fillRect(x, y, 10, 10);
					}
				}
							
				/* Draw enemies*/
				var enemies = disputes[year][i].enemies;
				map_context.fillStyle = "rgba(250,50,50,.2)";
				for(var j=0; j<enemies.length; j++){
					if(coordinates[enemies[j]] !== undefined){
						var x = coordinates[enemies[j]][3].x *.75 -70;
						var y = coordinates[enemies[j]][3].y *.75 -50;
						map_context.fillRect(x, y, 10, 10);
					}
				}
	
			}
		}
		
		/* TODO: Use Google Maps to mitigate inaccuracies */
		/* TODO: Highlight points for current conflict */
		/* TODO: Draw bezier curves between relationships */
		
  	};
  	map.src = "images/world.75.png";		
		
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
	
	/* Timeline data */
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
				drag_start = true;
			}
			else if(x<date_end+10 && x>date_end-10){
				drag_end = true;
			}
		}

	}, false);

	timeline_canvas.addEventListener("mousemove", function(ev){
		var x = event.pageX - timeline_canvas.offsetLeft;

		if(drag_start && (timelinePixelToYear(date_end)-timelinePixelToYear(x) >= 20) && (x>x_start_min)){
			/* Redraw the timeline */
			drawTimeline(x, date_end);
			date_start = x;
			
			/* Redraw conflicts list */
			updateConflicts();
			/* Redraw the map */
			//updateMap();
		}
		
		else if(drag_end && (timelinePixelToYear(x)-timelinePixelToYear(date_start) >= 20) && (x<x_end_max)){
			drawTimeline(date_start, x);
			date_end = x;
			
			/* Redraw conflicts list */
			updateConflicts();
			/* Redraw the map */
			//updateMap();
		}
		
	}, false);
	
	timeline_canvas.addEventListener("mouseup", function(ev){
		drag_start = false;
		drag_end = false;
		updateConflicts();
		updateMap();

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