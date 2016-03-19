
var Map = function (options) {
    this.data = [];
    this.options = $.extend({
        width: 1152,
        height: 600,
        domain: [0, 90],
        column: 'count',
        colors: colorbrewer.Reds[9],
        //domain: [( Math.floor(minValue / 1000) * 1000), ( Math.ceil(maxValue / 1000) * 1000)],
        projection: d3.geo.naturalEarth,
        scale: 200,
        translate: [1152 / 2, 600 / 2],
        zoomFactor: 2,
        duration: 2000,
        valueScale: d3.scale.quantize,
        format: function(d) {
            d = d;
            return d3.format(',.00f')(d);
        },
        onReady: function () { console.log('onReady') }
    }, options);
    
    var promise = new Promise(function(resolve, reject) {
        d3.json('data/countries.json', function(err, data) {
            (err) ? reject(err) : resolve(data);
        });
    })
    .then(this.init.bind(this))
    .catch(function(err) { 
        console.log(err);
    });
}

Map.prototype.init = function (data) {
    this.topojson = data;
    
    var maxValue = Math.max.apply(Math, this.data.map(function(x){return x.count;})),
        minValue = Math.min.apply(Math, this.data.map(function(x){return x.count;}));
    
    this.projection = this.options.projection()
        .scale(this.options.scale)
        .translate(this.options.translate)
        .precision(0.1);

    this.path = d3.geo.path()
        .projection(this.projection);
    
    this.map = d3.geomap.choropleth()
        .geofile('data/countries.json')
        .projection(d3.geo.naturalEarth)
        .width(this.options.width)
        .height(this.options.height)
        .scale(this.options.scale)
        .translate(this.options.translate)
        .zoomFactor(this.options.zoomFactor)
        .colors(this.options.colors)
        .column(this.options.column)
        .domain(this.options.domain)
        .format(this.options.format)
        .duration(this.options.duration)
        .legend(true, {transform: "translate(0,320)"})
        .postUpdate(this.options.onReady)
        .valueScale(this.options.valueScale)
        .unitId('_id');
    
    d3.select('#map')
        .datum(this.data)
        .call(this.map.draw, this.map);
}

Map.prototype.setData = function (data) {
    this.data = data;
}

Map.prototype.update = function (callback) {
    d3.select('#map')
        .datum(this.data)
    
    if (callback) {
        this.map.postUpdate(callback);
    } else {
        this.map.postUpdate(function () {});
    }
    
    this.map.data = d3.select('#map').datum();
    
    this.map.update();
}

Map.prototype.drawLines = function () {
    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null),
        colorScale = this.options.valueScale().domain(this.options.domain).range(this.options.colors);
        lines = [];

    for (var i = 0; i < this.data.length; i++) {
        var id = this.data[i]._id,
            count = this.data[i].count;
    
        for (var y = 0; y < features.length; y++) {
            if ( features[y].id ==  id ){
                lines.push({ 
                    type: "LineString",
                    coordinates: [[4.8909347, 52.3738007], cleanPath.centroid(features[y])],
                    color: colorScale(count)
                });
                break;
            }
        }
    }

    d3.select('g.zoom')
        .append('g')
        .attr('class', 'lines')
        .selectAll("path .edge") 
        .data(lines)
        .enter()
        .append("path")
        .attr("class", "edge")
        .attr("d", this.path)
        .style('stroke', function(d) { return d.color; })
        .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); } )
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); } )
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
}

Map.prototype.drawDots = function(){

    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null),

        dots = [];

    for (var i = 0; i < this.data.length; i++) {
        var id = this.data[i]._id,
            count = this.data[i].count;
    
        for (var y = 0; y < features.length; y++) {
            if ( features[y].id ==  id ){
                dots.push(cleanPath.centroid(features[y]));
                break;
            }
        }
    }

    var fiveDots = [[4.8909347, 52.3738007], [51.124213, 10.195313],[47.040182, 1.757813], [52.908902, -8.789062], [53.330873, -1.054687]]

    //console.log(dots);
    d3.select('g.zoom')
        .append('g')
        .attr('class', 'dots')
        .selectAll("path .edge") 
        .data(fiveDots).enter()
        .append("circle")
        .attr("cx", function (d) { 
            console.log(d);
            return map.projection(d)[0]; })
        .attr("cy", function (d) { 
            console.log(d);
            return map.projection(d)[1]; })
        .attr("r", "2px")
        .attr("fill", "blue")
}

Map.prototype.hideLines = function () {
    d3.selectAll('.lines .edge')
        .transition()
        .duration(1500)
        .ease("linear")
        .style('opacity', 0)
        .attr("stroke-dashoffset", function() { return -this.getTotalLength(); } )
}

