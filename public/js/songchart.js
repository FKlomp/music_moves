//set up canvas and bar sizes
var canvasWidth = 400,
    canvasHeight = 300,
    otherMargins = 40,
    leftMargin = 10,
    maxBarWidth = canvasHeight - - otherMargins - leftMargin
    maxChartHeight = canvasHeight - (otherMargins * 2);

//set up linear scales
var xScale = d3.scale.linear()
              .range([0, maxBarWidth]);

var yScale = d3.scale.ordinal();

//add svg to songchart
var chart = d3.select(".songchart").append("svg")
                            .attr("width",canvasWidth)
                            .attr("height", canvasHeight);                       

//set up axis                            
var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5);

var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickSize(0);

//add in data
  d3.xhr("topsongs.csv").get(function (error, response) {
    
    //retrieve data
    var CSV = response.responseText;
    var data = d3.csv.parse(CSV)

    //get variable names
    var keys = d3.keys(data[0]);
    var namesTitle = keys[0];
    var valuesTitle = keys[1];

    //accessing the properties of each object with the variable name through its key
    var values = function(d) {return +d[valuesTitle];};
    var names = function(d) {return d[namesTitle];}

    // find highest value
    var maxValue = d3.max(data, values); 
    
    //set y domain
    yScale.domain(data.map(names));
    
    //set x domain
    xScale.domain([0, maxValue]).nice(); 

  //set bar width with rangeBands ([x axis width], gap between bars, gap before and after bars) as a proportion of bar width  
  yScale.rangeBands([0, maxChartHeight], 0.1, 0.25);
  
  //set up rectangle elements with attributes based on data
  var rects = chart.selectAll("rect")
                  .data(data)
                  .enter()
                  .append("rect");

  //set up attributes of svg rectangle elements based on attributes
  var rectAttributes = rects
                        .attr("x", leftMargin)
                        .attr("y", function (d) {return yScale(d[namesTitle]) + otherMargins; })
                        .attr("width", function (d) {return xScale(d[valuesTitle])})
                        .attr("height", yScale.rangeBand())
                        .attr("fill", "#5eb9c9")

                        //add song title to bar
                        .attr("songtitle", function(d, i) {
                          chart.append("text")
                                .attr("x", leftMargin + 6)
                                .attr("y", parseFloat(d3.select(this).attr("y")) + (parseFloat(d3.select(this).attr("height")) / 2))
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "start")
                                .attr("font-family", "sans-serif")
                                .attr("font-size", "14px")
                                .attr("fill", "black")
                                .text(d[namesTitle]);
                        })

                        //change color of bar
                        .on("mouseover", function(d) {
                          d3.select(this)
                                .attr("fill", "#83C8D4");
                        })
                        .on("mouseout", function(d) {
                          d3.select(this)
                            .transition()
                            .duration(250)
                            .attr("fill", "#5eb9c9");
                        });

  //append x axis
  chart.append("g")
        .attr("transform", "translate(" + leftMargin + ", " + (maxChartHeight + otherMargins) + ")")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1)
        .style("shape-rendering", "crispEdges")
        .call(xAxis)
          .selectAll("text")
          .attr("stroke", "none")
          .attr("fill", "black");

  //append y axis
  chart.append("g")
        .attr("transform", "translate(" + leftMargin + ", " + otherMargins + ")")
        .attr("font-size", "0px")
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1)
        .call(yAxis)

    //x axis title        
    chart.append("text")
          .attr("dy", "8")
          .attr("x", (maxBarWidth / 2) + leftMargin)
          .attr("y", canvasHeight - (otherMargins / 3))
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("fill", "black")
          .text(valuesTitle);
});

//while the data is being loaded it turns the strings into a number
function type(d) {
  d[yName] = +d[yName];
  return d;
}