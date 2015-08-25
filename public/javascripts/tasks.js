function updateGraph(chartDivId, options, width, height){
	var totalTasks = options.totalTasks;
	var percentComplete = 1.0 * options.percentComplete;
	var graphData = [];
	if(totalTasks!=0 && 100-percentComplete == 0 ) {
		graphData = [
			{"label": percentComplete.toFixed(2) + "% complete", "value": percentComplete, "color":"#66BBBB"}
		];
	} else if ( totalTasks!=0 && percentComplete == 0 ){
		graphData = [
			{"label": (100.00 - percentComplete).toFixed(2) + "% incomplete", "value": 100.00 - percentComplete, "color":"#ee7766"}
		];
	} else {
		graphData = [
			{"label": percentComplete + "% complete", "value": percentComplete, "color":"#66BBBB"},
			{"label": (100.00 - percentComplete).toFixed(2) + "% incomplete", "value": 100.00 - percentComplete, "color":"#ee7766"}
		];
	}
	var w = width || 400;
	var h = height || 400;
	var r = h/2;

	var data = graphData || [];
	//[{"label":"complete", "value": 40, "color":"#66BBBB"}, 
	//	          {"label":"incomplete", "value": 60, "color":"#ee7766"}];
	$('#' + chartDivId).html('');

	var vis = d3.select('#' + chartDivId).append("svg:svg").data([graphData]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
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
	}).fail(function(err){
		console.error(err);
	});
}

function deleteTask(id){
	$.ajax({
		url: "/tasks/" + id,
		type: "DELETE"
	}).done(function(result){
	}).fail(function(err){
		console.error(err);
	});
}

function showEdit(id){
	$("#edit-"+id).closest("div").slideDown(250).removeClass('hide');
}

function updateElementDescription(id, description){
	$("#edit-"+id).closest("div").slideUp(250).addClass('hide');
	$("label[for='" + id + "']").text(description);
}

function submitTaskDescriptionUpdate(id, description, callback){
	$.ajax({
		url: "/tasks/" + id + "/edit",
		type: "POST",
		dataType: 'json',
		data:  { description: description }
	}).done(function(result){
	    	callback();
	}).fail(function(err){
		callback(new Error("Failed to update task description"));
	});
}


$( document ).ready(function() {
var completed = $('#my-list-done .js-grouping').length;
var incomplete = $('#my-list .js-grouping').length;
var totalTasks = completed + incomplete; 
var percentComplete = (100 * (completed * 1.0 / totalTasks)).toFixed(2);
updateGraph('chart', {totalTasks: totalTasks, percentComplete: percentComplete});
$(":checkbox").each(function(){
	if($(this).is(':checked')){
		$("label[for='"+$(this).attr("id")+"']").css("textDecoration", "line-through");
	}
});

$(":checkbox").on("change", function(e){
	// e.preventDefault();
	var itemId = $(this).attr('id');
	var element;
	markTaskCompleted(itemId);
	if($(this).is(":checked")){
		$('#edit-submit-'+itemId).closest('div.js-taskUpdate').addClass('hide');
		element = $("label[for='"+itemId+"']").css("textDecoration", "line-through").closest('div .js-grouping').clone(true, true);
		$("label[for='"+itemId+"']").closest('div .js-grouping').remove();
		$("#my-list-done").append($(element));
		
		$('#edit-pencil-'+itemId).addClass('hide');
		
		
		completed = $('#my-list-done .js-grouping').length;
		incomplete = $('#my-list .js-grouping').length;
		totalTasks = completed + incomplete;
		percentComplete = (100 * (completed * 1.0 / totalTasks)).toFixed(2);
		updateGraph('chart', {totalTasks: totalTasks, percentComplete: percentComplete});
	} else {
		$('#edit-pencil-'+itemId).removeClass('hide');
		element = $("label[for='"+itemId+"']").css("textDecoration", "none").closest('div .js-grouping').clone(true, true);
		$("label[for='"+itemId+"']").closest('div .js-grouping').remove();
		$("#my-list").append($(element));

		completed = $('#my-list-done .js-grouping').length;
		incomplete = $('#my-list .js-grouping').length;
		totalTasks = completed + incomplete;
		percentComplete = (100 * (completed * 1.0 / totalTasks)).toFixed(2);
		updateGraph('chart', {totalTasks: totalTasks, percentComplete: percentComplete});
	}
});



$(".glyphicon-trash").on("click", function(){
	$(this).parent().slideUp();
})

$('form.js-taskUpdate-form').submit(function(e){
	e.preventDefault();
	var id = $(this).data("task-id");
	var description = $(this).children("input#edit-" + id).val();
	submitTaskDescriptionUpdate(id, description, function(err){
		if(err){
			alert(err.message);
		} else {
			updateElementDescription(id, description);	
		}
	});
})



});