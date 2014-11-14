function enablePlotting(){
	$('.bottom-div').show();
}


function disablePlotting(){
	$('.bottom-div').hide();
	//$( "#plotting" ).empty();     
}

function updateData(array,platform,instrument){
    console.log("updateData");
	enablePlotting();
	$( "#plotting" ).empty();  

	$( '#plotting' ).hide();
	$('#processing-icon').show();

    getData(array,platform,instrument,$('#stream-select option:selected').text(), $( "#variable-select option:selected").attr("value"));

}

function getTimeCoverage(array,platform,instrument) {
    console.log("getTimeCoverage");
    var instrument = $( "#currentInstrument" ).text();      
    var stream = $('#stream-select option:selected').text();

    instrument = instrument.replace(/-/g, '_');
    var url = "/get_time_coverage/" + instrument + "/" + stream;
    console.log("Attempting", url);


    $.getJSON(url, function( data ) {  
        console.log("This is the data");
        console.log(data);
        var end_date = new Date(data['time_coverage_end']);
        var start_date = new Date(data['time_coverage_end']);
        start_date = start_date.setDate(start_date.getDate() - 14);

        $('#datetimepicker_from').data("DateTimePicker").setDate(new Date(start_date))
        $('#datetimepicker_to').data("DateTimePicker").setDate(new Date(end_date))
        console.log(start_date);
        console.log(end_date);
    });

}

var getDataXHR = null;

function getData(array,platform,instrument,stream,variable){
	//get the from date
	from_dt = ($('#datetimepicker_from').data("DateTimePicker").getDate().toISOString());
	to_dt   = ($('#datetimepicker_to').data("DateTimePicker").getDate().toISOString());	

	url  = "/getdata/?"
	url += "dataset_id="+instrument + '_' + stream
	url += "&startdate="+from_dt
	url += "&enddate="+to_dt
	url += "&variables="+variable

	console.log(url)
    if(getDataXHR != null) {
        console.log("Aborting other XHR request");
        getDataXHR.abort();
        getDataXHR = null;
    }

	getDataXHR = $.ajax({		
		type: 'GET',
        url: url,  
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    })
    .success(function(data){
    	$('#plotting').show();
		$('#processing-icon').hide();
    	makePlot(array,platform,instrument,variable,data);
    })
	.error(function(xhr, status, error) {
		//var err = eval("(" + xhr.responseText + ")");
    	console.log( "error:",error );
    });
}

function getRowData(rows){

}

function makePlot(array,platform,instrument,variable,data){
	console.log(data)
	rowdata = data["rows"]
	units = data["columnUnits"][1]

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(new Date(d[0])); })
	    .y(function(d) { return y(d[1]); });

	var svg = d3.select("#plotting").append("svg")
	    .attr("id","plotview")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(d3.extent(rowdata, function(d) { return new Date(d[0]);}));
	y.domain(d3.extent(rowdata, function(d) { return d[1]; }));

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)	      
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(units);

	  svg.append("path")
	      .datum(rowdata)
	      .attr("class", "line")
	      .attr("d", line);

}