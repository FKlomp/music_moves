var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var svg = d3.select("#languagechart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("lyriclanguage.csv", function(error, data) {
  console.log(data);
    data.forEach(function(d) {
        d.date = d.language;
        d.value = +d.value;
    });
	
  x.domain(data.map(function(d) { return d.language; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-55)" );

  svg.append("g")
      .attr("class", "y axis")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .call(yAxis)
    .append("text")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Songs played");

  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "#BCE629")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });
});