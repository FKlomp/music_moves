var SongChart = function () {
    this.options = {
        x: 50,
        y: 15,
        width: 350,
        height: 300,
        column: 'count',
        unit: function(d) {
            return d._id.song;
        },
        format: function (d) {
            return d.artist.name + " - " + d._id.song;
        }
    }
    
    this.xScale = d3.scale.linear().range([0, this.options.width]);
    this.yScale = d3.scale.ordinal();
    
    this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("bottom")
                .ticks(5);

    this.yAxis = d3.svg.axis()
                .scale(this.yScale)
                .orient("left")
                .tickSize(0);
            
    this.chart = d3.select("#songchart").append("svg")
        .attr("width", this.options.width)
        .attr("height", this.options.height);
        
    this.chart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + this.options.x + ", " + (this.options.y + 195) + ")")
        .style("fill", "none")
        .style("stroke", "black") 
        .style("stroke-width", 1);
        
    this.chart.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + this.options.x + ", " + this.options.y + ")")
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);
}

SongChart.prototype.setData = function (data) {
    var i;

    for (i = data.length; i < 5; i++) {
        data[i] = {
            _id: {
                song: ''
            }, 
            artist: {
                name: ''
            }
        }
        
        data[i][this.options.column] = 0;
    }
    
    var values = data.map(function (d) { return d[this.options.column]; }.bind(this)),
        names = data.map(this.options.unit),
        max = d3.max(values);
    
    this.data = data;
    
    this.xScale.domain([0, max]).nice();
    
    this.yScale.domain(names);
    this.yScale.rangeBands([0, 200], 0.1, 0.25);
    
    this.chart.selectAll(".xAxis")
        .call(this.xAxis)
        .selectAll("text")
        .attr("stroke", "none")
        .attr("fill", "black");
        
    this.chart.selectAll(".yAxis")
        .call(this.yAxis)
        .selectAll("text")
        .attr("display", "none");
    
    this.rects = this.chart.selectAll("rect")
        .data(this.data)
        .attr("width", function (d) { return this.xScale(d[this.options.column]); }.bind(this))
        .enter()
        .append("rect")
        .attr("x", this.options.x)
        .attr("y", function (d) { return this.options.y + this.yScale(this.options.unit(d)); }.bind(this))
        .attr("width", function (d) { return this.xScale(d[this.options.column]); }.bind(this))
        .attr("height", this.yScale.rangeBand())
        .attr("fill", "#5eb9c9")
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", "#83C8D4");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("fill", "#5eb9c9");
        })
            
    this.titles = this.chart.selectAll(".bar_title")
        .data(this.data)
        .text(this.options.format)
        .enter()
        .append("text")
        .attr("class", "bar_title")
        .attr("x", this.options.x + 5)
        .attr("y", function (d) { return this.options.y + this.yScale(this.options.unit(d)) + 20; }.bind(this))
        .attr("width", this.options.width)
        .attr("height", this.yScale.rangeBand())
        .text(this.options.format);
}