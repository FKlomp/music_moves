var LineChart = function () {
    this.options = {
        x: 60,
        y: 10,
        width: 320,
        height: 240,
        dateFormat: d3.time.format("%b-%y"),
        bisectDate: d3.bisector(function(d) { return d.date; }).left
    }
    
    this.xScale = d3.time.scale().range([0, (this.options.width - 40) ]);
    this.yScale = d3.scale.linear().range([(this.options.height - 40), 0]);

    this.xAxis = d3.svg.axis()
                .tickFormat(function(d) {
                    return this.options.dateFormat(d); 
                }.bind(this))
                .scale(this.xScale)
                .orient("bottom")
                .ticks(2);

    this.yAxis = d3.svg.axis()
                .scale(this.yScale)
                .orient("left")
                .ticks(5);
                
    this.line = d3.svg.line()
            	.x(function(d) { return this.xScale(d.date); }.bind(this))
            	.y(function(d) { return this.yScale(d.count); }.bind(this));
                
    this.chart = d3.select("#popchart")
        	.append("svg")
        		.attr("width", this.options.width + 40)
        		.attr("height", this.options.height + 40)
            .append("g")
                .attr("transform", "translate(" + this.options.x + ", " + this.options.y + ")");
    
    this.chart.append("path")
            .attr("transform", "translate(0,0)")
            .attr("class", "pop-line");
                
    this.chart.append("g")
            .attr("transform", "translate(0," + (this.options.height - 40) + ")")
            .attr("class", "pop-x-axis");
                
    this.chart.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "pop-y-axis");
    
    function mousemove() {
        var y,
            pos = d3.mouse(this.rect.node()),
            x = pos[0] + 5,
            date = this.xScale.invert(x),
            i = this.options.bisectDate(this.data, date),
            d = this.data[i];
            
            if(d){
                if(this.data[i - 1]) {
                    var date0 = this.data[i - 1];
                    var date1 = this.data[i];
                    d = ((date - date0.date) > (date1.date - date)) ? date1 : date0;
                }
    
                this.circle
                    .attr("transform", "translate(" + this.xScale(d.date) + ", " + this.yScale(d.count) + ")");
                
                this.label.html(this.options.dateFormat(d.date))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            }
    }
    
    this.rect = this.chart.append("rect")
            .attr("width", this.options.width + 40)
            .attr("height", this.options.height + 40)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { 
                this.circle.style("display", null); 
                this.label.style("display", null);
            }.bind(this))
            .on("mouseout", function() { 
                this.circle.style("display", "none"); 
                this.label.style("display", "none");
            }.bind(this))
            .on("mousemove", mousemove.bind(this));
            
    this.circle = this.chart.append("circle")
            .style("display", "none")
            .style("fill", "none")
            .style("stroke", "steelblue")
            .attr("r", 5)
    
    this.label = d3.select('body').append("div")
            .style("display", "none")
            .attr("class", "pop-tooltip");
}

LineChart.prototype.setData = function (data) {
    this.data = data.map(function (d) { 
        return {
            date: new Date(d.date),
            count: d.count
        };
    }.bind(this));
    
    this.data.sort(function (a, b) {
        return a.date - b.date;
    });
    
    var minDate = d3.min(this.data, function(d) { return d.date; });
    var maxDate = d3.max(this.data, function(d) { return d.date; });
    var maxCount = d3.max(this.data, function(d) { return d.count; });
    
	this.xScale.domain([minDate, maxDate]);
	this.yScale.domain([0, maxCount]);
    
    if (maxCount < 5) {
        this.yAxis.ticks(maxCount);
    }
    
    this.xAxis.tickValues([minDate, maxDate]);
    
    this.chart.select('.pop-line')
        .attr("d", this.line(this.data));
    
    this.chart.select(".pop-x-axis")
        .call(this.xAxis)
        .attr("d", this.line(this.data))
        
    this.chart.select(".pop-y-axis")
        .call(this.yAxis)
        .attr("d", this.line(this.data))
        
    /*this.chart.selectAll('.point-circle')
        .data(this.data)
        .enter()
        .append('circle')
            .attr('class', 'point-circle')
            .attr('cx', function(d) { return this.xScale(d.date); }.bind(this))
            .attr('cy', function(d) { return this.yScale(d.count); }.bind(this))
            .attr('r', 5)
            .style("stroke", "steelblue")
            .style("fill", "none");*/
}