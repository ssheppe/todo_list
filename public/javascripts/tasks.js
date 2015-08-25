function updateGraph(chartDivId, data, width, height){
	var w = width || 400;
	var h = height || 400;
	var r = h/2;

	data = data || [];
	//[{"label":"complete", "value": 40, "color":"#66BBBB"}, 
	//	          {"label":"incomplete", "value": 60, "color":"#ee7766"}];
	$('#' + chartDivId).html('');

	var vis = d3.select('#' + chartDivId).append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
	var pie = d3.layout.pie().value(function(d){return d.value;});

	// declare an arc generator function
	var arc = d3.svg.arc().outerRadius(r);

	// select paths, use arc generator to draw
	var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
	arcs.append("svg:path")
	    .attr("fill", function(d, i){
	        return d.data.color;
	    })
	    .attr("d", function (d) {
	        // log the result of the arc generator to show how cool it is :)
	        // console.log(arc(d));
	        return arc(d);
	    });

	// add the text
	arcs.append("svg:text").attr("transform", function(d){
				d.innerRadius = 0;
				d.outerRadius = r;
	    return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").text( function(d, i) {
	    return data[i].label;}
	);

}

function markTaskCompleted(id){
	$.ajax({
		url: "/tasks/" + id,
		type: "PUT"
	}).done(function(result){
		console.log("success")
	}).fail(function(err){
		console.error(err);
	});
}

function deleteTask(id){
	$.ajax({
		url: "/tasks/" + id,
		type: "DELETE"
	}).done(function(result){
		console.log("success")
	}).fail(function(err){
		console.error(err);
	});
}

// function showEdit(id){
// 	$("#edit-"+id).closest("div").slideDown(250).removeClass('hide');
// }

// function updateElementDescription(id, description){
// 	$("#edit-"+id).closest("div").slideUp(250).addClass('hide');
// 	$("label[for='" + id + "']").text(description);
// }

// function submitTaskDescriptionUpdate(id, description, callback){
// 	$.ajax({
// 		url: "/tasks/" + id + "/edit",
// 		type: "POST",
// 		dataType: 'json',
// 		data:  { description: description }
// 	}).done(function(result){
// 			console.log("AJAX done")
// 	    	callback();
// 	}).fail(function(err){
// 		callback(new Error("Failed to update task description"));
// 	});
// }


$( document ).ready(function() {
var	completed = $('#my-list-done .list-group-item').length;
var incomplete = $('#my-list .list-group-item').length;
var totalTasks = completed + incomplete; 
console.log("completed: " + completed);
console.log("incomplete: " + incomplete);
if(totalTasks==completed && totalTasks!=0){
	updateGraph('chart', 
		[{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"}]);
}else if(totalTasks!=0){
	updateGraph('chart', 
	[
		{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"},
		{"label":"incomplete", "value": 100 * (incomplete * 1.0 / totalTasks), "color":"#ee7766"}
		]
	);
}
$(":checkbox").each(function(){
	if($(this).is(':checked')){
		$("label[for='"+$(this).attr("id")+"']").css("textDecoration", "line-through");
	}
});

$(":checkbox").on("change", function(e){
	e.preventDefault();
	var itemId = $(this).attr('id');
	markTaskCompleted(itemId);
	console.log("Updating chart")
	if($(this).is(":checked")){
		$("label[for='"+$(this).attr("id")+"']").css("textDecoration", "line-through");
			$(this).closest('div').slideUp(250,function(){
				$(this).show().closest('div').hide().appendTo('#my-list-done').slideDown(250).animate({opacity: 1.0});
			completed = $('#my-list-done .list-group-item').length;
			incomplete = $('#my-list .list-group-item').length;
			totalTasks = completed + incomplete;

			console.log("Updating chart if c %s ic %s t %s", completed, incomplete, totalTasks)
			if(totalTasks==completed && totalTasks!=0){
				updateGraph('chart', 
					[{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"}]);
			}else if(totalTasks!=0){
				updateGraph('chart', 
				[
					{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"},
					{"label":"incomplete", "value": 100 * (incomplete * 1.0 / totalTasks), "color":"#ee7766"}
					]
				);
			}
			})

	}
	else{
		$("label[for='"+$(this).attr("id")+"']").css("textDecoration", "none");
		$(this).closest('div').slideUp(250,function(){

				$(this).show().closest('div').hide().appendTo('#my-list').slideDown(250).animate({opacity: 1.0});
			completed = $('#my-list-done .list-group-item').length;
			incomplete = $('#my-list .list-group-item').length;
			totalTasks = completed + incomplete;
			console.log("Updating chart else c %s ic %s", completed, incomplete)
			if(totalTasks==completed && totalTasks!=0){
				updateGraph('chart', 
					[{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"}]);
			}else if(totalTasks!=0){
				updateGraph('chart', 
				[
					{"label":"complete", "value": 100 * (completed * 1.0 / totalTasks), "color":"#66BBBB"},
					{"label":"incomplete", "value": 100 * (incomplete * 1.0 / totalTasks), "color":"#ee7766"}
					]
				);
			}
			})		
	}
});



$(".glyphicon-trash").on("click", function(){
	console.log("here in trash");
	$(this).parent().slideUp();
})

// $('form.js-taskUpdate').submit(function(e){
// 	e.preventDefault();
// 	var id = $(this).data("task-id");
// 	var description = $(this).children("input#edit-" + id).val();
// 	submitTaskDescriptionUpdate(id, description, function(err){
// 		if(err){
// 			alert(err.message);
// 		} else {
// 			updateElementDescription(id, description);	
// 		}
// 	});
// })



});