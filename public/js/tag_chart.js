var TagChart = function () {
    this.options = {
        x: 30,
        y: -20,
        width: 350,
        height: 280,
        column: 'count',
        colors: d3.scale.category10(),
        unit: function(d) {
            return d._id;
        },
        format: function (d) {
            return d._id;
        }
    }
    
    this.layout = d3.layout.pack()
        .sort(null)
        .size([this.options.width, this.options.height])
        .padding(1.5);
        
    this.chart = d3.select("#tag-chart")
        .append("svg")
        .attr("width", this.options.width)
        .attr("height", this.options.height)
        .attr("class", "tagchart");
        
    this.bubbles = this.chart.append("g")
        .attr("transform", "translate(" + this.options.x + ", " + this.options.y + ")")
        
}

TagChart.prototype.setData = function (data) {
    this.data = data.map(function (d) { 
        d.value = d[this.options.column]; 
        
        return d;
    }.bind(this)),

    console.log(this.data);
    this.nodes = this.layout.nodes( { parent: null, children: this.data } ).filter(function(d) { return !d.children; });
     
    this.bubbles.selectAll('.bubble')
        .data(this.nodes)
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return this.options.colors(d.value); }.bind(this))
        .enter()
        .append("circle")
        .attr('class', 'bubble')
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return this.options.colors(d.value); }.bind(this));
        
    this.bubbles.selectAll('.bubbletext')
        .data(this.nodes)
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .text(this.options.format)
        .enter()
        .append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .attr("class", "bubbletext")
        .text(this.options.format)
        .style({
            "fill":"white", 
            "font-family":"Arial",
            "font-size": "12px"
        });
}
