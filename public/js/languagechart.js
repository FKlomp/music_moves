var margin_languagechart = {top: 20, right: 20, bottom: 70, left: 40},
    width_languagechart = 300 - margin_languagechart.left - margin_languagechart.right,
    height_languagechart = 300 - margin_languagechart.top - margin_languagechart.bottom;

var x_languagechart = d3.scale.ordinal().rangeRoundBands([0, width_languagechart], .05);

var y_languagechart = d3.scale.linear().range([height_languagechart, 0]);

var xAxis_languagechart = d3.svg.axis()
    .scale(x_languagechart)
    .orient("bottom")

var yAxis_languagechart = d3.svg.axis()
    .scale(y_languagechart)
    .orient("left")
    .ticks(5);

var svg_languages = d3.select("#languagechart").append("svg")
    .attr("width", width_languagechart+ margin_languagechart.left + margin_languagechart.right)
    .attr("height", height_languagechart + margin_languagechart.top + margin_languagechart.bottom)
  	.append("g")
    .attr("transform", 
          "translate(" + margin_languagechart.left + "," + margin_languagechart.top + ")");

d3.csv("lyriclanguage.csv", function(error, data) {
  console.log(data);
    data.forEach(function(d) {
        d.date = d.language;
        d.value = +d.value;
    });
	
  x_languagechart.domain(data.map(function(d) { return d.language; }));
  y_languagechart.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg_languages.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis_languagechart)
    .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-55)" );

  svg_languages.append("g")
      .attr("class", "y axis")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .call(yAxis_languagechart)
    .append("text")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Songs played");

  svg_languages.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "#BCE629")
      .attr("x", function(d) { return x_languagechart(d.date); })
      .attr("width", x_languagechart.rangeBand())
      .attr("y", function(d) { return y_languagechart(d.value); })
      .attr("height", function(d) { return height_languagechart - y_languagechart(d.value); });
});
