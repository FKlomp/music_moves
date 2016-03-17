
var Map = function (onReady) {
    var requests = [
        new Promise(function(resolve, reject) {
            d3.csv('data/streamwatchr_dump.csv', function(err, data) {
                (err) ? reject(err) : resolve(data);
            });
        }),
        new Promise(function(resolve, reject) {
            d3.json('api/streamwatch/artist/country', function(err, data) {
                (err) ? reject(err) : resolve(data);
            });
        }),
        new Promise(function(resolve, reject) {
            d3.json('data/countries.json', function(err, data) {
                (err) ? reject(err) : resolve(data);
            });
        }),
    ];
    
    Promise.all(requests)
    .then(function(resources) {
        this.songMonthly = resources[0];
        this.artistGeoTotal = resources[1];
        this.topojson = resources[2];
        
        this.init();
        
    }.bind(this))
    /*.catch(function(err) { 
        console.log(err);
    });*/
    
    this.onReady = onReady;
}

Map.prototype.init = function () {
    var maxValue = Math.max.apply(Math, this.artistGeoTotal.map(function(x){return x.count;})),
        minValue = Math.min.apply(Math, this.artistGeoTotal.map(function(x){return x.count;}));
        
    this.options = {
        width: 1152,
        height: 600,
        domain: [0, 9000],
        //domain: [( Math.floor(minValue / 1000) * 1000), ( Math.ceil(maxValue / 1000) * 1000)],
        projection: d3.geo.naturalEarth,
        scale: 200,
        translate: [1152 / 2, 600 / 2],
        format: function(d) {
            d = d;
            return d3.format(',.00f')(d);
        }
    }
    
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
        .zoomFactor(2)
        .colors(colorbrewer.Reds[9])
        .column('count')
        .domain(this.options.domain)
        .format(this.options.format)
        .legend(true, {transform: "translate(0,320)"})
        .unitId('_id');
    
    d3.select('#map')
        .datum(this.artistGeoTotal)
        .call(this.map.draw, this.map);
        
    setTimeout(this.onReady, 1000);
}

Map.prototype.onReady = function () { console.log('map ready') };

Map.prototype.drawLines = function () {
    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null),
        coordinates = [];

    for (var i = 0; i < this.artistGeoTotal.length; i++) {
        var id = this.artistGeoTotal[i]._id;
    
        for (var y = 0; y < features.length; y++) {
            if ( features[y].id == id ){  
                coordinates.push([[4.8909347, 52.3738007], cleanPath.centroid(features[y])]);

                break;
            }
        }
    }
    
    var lines = [];
    
    for (var i = 0; i < coordinates.length; i++) {
        lines.push({ 
            "type": "LineString",
            "coordinates": coordinates[i]
        });
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
        .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); } )
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); } )
        .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
        
    setTimeout(this.hideLines, 2000);
}

Map.prototype.hideLines = function () {
    d3.selectAll('.lines .edge')
        .transition()
        .duration(2000)
        .ease("linear")
        .style('opacity', 0)
        .attr("stroke-dashoffset", function() { return -this.getTotalLength(); } )
}

