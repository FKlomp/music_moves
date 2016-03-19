var	marginpop = {top: 30, right: 20, bottom: 30, left: 50},
	widthpop = 800 - marginpop.left - marginpop.right,
	heightpop = 270 - marginpop.top - marginpop.bottom;
 
// Parse the date / time
var	parseDatepop = d3.time.format("%d-%b-%y").parse;
 
// Set the ranges
var	xpop = d3.time.scale().range([0, widthpop]);
var	ypop = d3.scale.linear().range([heightpop, 0]);
 
// Define the axes
var	xAxispop = d3.svg.axis()
	.scale(xpop)
	.orient("bottom").ticks(5);

var	yAxispop =  d3.svg.axis()
	.scale(ypop)
	.orient("left").ticks(5);
 
// Define the line
var	valuelinepop = d3.svg.line()
	.x(function(d) { return xpop(d.date); })
	.y(function(d) { return ypop(d.close); });
    
// Adds the svg canvas
var	svgpop = d3.select(".popchart")
	.append("svg")
		.attr("width", widthpop + marginpop.left + marginpop.right)
		.attr("height", heightpop + marginpop.top + marginpop.bottom)
	.append("g")
		.attr("transform", "translate(" + marginpop.left + "," + marginpop.top + ")");
 
// Get the data
d3.csv("popularity.csv", function(error, data) {
	data.forEach(function(d) {
		d.date = parseDatepop(d.date);
		d.close = +d.close;
	});
 
	// Scale the range of the data
	xpop.domain(d3.extent(data, function(d) { return d.date; }));
	ypop.domain([0, d3.max(data, function(d) { return d.close; })]);
 
	// Add the valueline path.
	svgpop.append("path")	
		.attr("class", "line")
		.attr("d", valuelinepop(data));
 
	// Add the X Axis
	svgpop.append("g")		
		.attr("class", "x axis")
		.attr("transform", "translate(0," + heightpop + ")")
		.call(xAxispop);
 
	// Add the Y Axis
	svgpop.append("g")		
		.attr("class", "y axis")
		.call(yAxispop);
 
});