
var Map = function (options) {
    this.data = [];
    
    this.options = $.extend({
        width: 1152,
        height: 600,
        domain: [0, 0],
        column: 'count',
        colors: colorbrewer.Reds[9],
        projection: d3.geo.naturalEarth,
        scale: 200,
        translate: [1152 / 2, 600 / 2],
        zoomFactor: 3,
        duration: 2000,
        valueScale: d3.scale.threshold,
        unitId: '_id',
        format: function(d) {
            d = d;
            return d3.format(',.00f')(d);
        },
        onZoomIn: function (d) { console.log('in', d) },
        onZoomOut: function (d) { console.log('out', d) },
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
        .legend(false)
        .postUpdate(this.options.onReady)
        .onZoomIn(this.options.onZoomIn)
        .onZoomOut(this.options.onZoomOut)
        .valueScale(this.options.valueScale)
        .unitId(this.options.unitId);
    
    d3.select('#map')
        .datum(this.data)
        .call(this.map.draw, this.map);
}

Map.prototype.setData = function (data) {
    var unitIds = data.map(function (d) { return d[this.options.unitId] }.bind(this));
    for (var i = 0; i < this.data.length; i++) {
        if (unitIds.indexOf(this.data[i][this.options.unitId]) == -1) {
            this.data[i][this.options.column] = 0;
            data.push(this.data[i]);
        }
    }
    
    this.data = data;
    
    var values = this.data.map(function(d) { return d.count; });

    // var min = d3.min(values);
    var max = d3.max(values);
    // var median = d3.median(values);
    var mean = d3.mean(values);
    // var deviation = d3.deviation(values);
    // var variance = d3.variance(values);
    // var quarter = d3.quantile(values, 0.25);
    // var thirdquarter = d3.quantile(values, 0.5);
    
    // console.log('min: ', min);
    // console.log('max: ', max);
    // console.log('median: ', median);
    // console.log('mean: ', mean);
    // console.log('deviation: ', deviation);
    // console.log('variance: ', variance);
    
    var beforeMean = this.floor(mean / 4);
    var afterMean =this.floor((max - mean) / 4);
    
    this.options.domain = [1*beforeMean, 2*beforeMean, 3*beforeMean, this.floor(mean), 1*afterMean, 2*afterMean, 3*afterMean, 4*afterMean];
    this.map.domain(this.options.domain);
}

Map.prototype.floor = function (val) {
    if (val < 10) {
        return val;
    } else if (val < 100) {
        return Math.floor(val / 10) * 10;
    } else if (val < 1000) {
        return Math.floor(val / 100) * 100;
    } else if (val < 10000) {
        return Math.floor(val / 1000) * 1000;
    } else if (val < 100000) {
        return Math.floor(val / 10000) * 10000;
    } else if (val < 1000000) {
        return Math.floor(val / 100000) * 100000;
    }
    
    return val;
}

/*Map.prototype.reset = function () {
    this.data = [];
    
    $('#map').empty();
    
    this.init(this.topojson);
}*/

Map.prototype.update = function (callback) {
    d3.select('#map')
        .datum(this.data)
    
    if (callback) {
        this.map.postUpdate(callback);
    } else {
        this.map.postUpdate(function () {});
    }
    
    this.map.data = d3.select('#map').datum();
    
    this.map.legend(true);
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

Map.prototype.drawDots = function(tourcoordinates){

    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null),

        dots = [];
    var coordinateAmsterdam = [4.8909347, 52.3738007];

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
    var fiveDots = tourcoordinates;
    fiveDots.push(coordinateAmsterdam);

    d3.select('g.zoom')
        .append('g')
        .attr('class', 'dots')
        .selectAll("path .edge") 
        .data(fiveDots).enter()
        .append("circle")
        .attr('id', function (d, i) {
            return "tourCountry-"+i;
        })
        .attr("cx", function (d) { 
            return map.projection(d)[0]; })
        .attr("cy", function (d) { 
            return map.projection(d)[1]; })
        .attr("r", "7px")
        .attr("fill", "white")
        .attr("stroke","#00F5F1")
        .style("stroke-width", "2")
}

Map.prototype.drawDotLines = function (tourcoordinates) {
    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null),
        routeLines = [];
    var tourRoute = [];
    var countriesArray = [];
    coordinateArray = tourcoordinates;
    var coordinateAmsterdam = [4.8909347, 52.3738007];
    var startCoordinate;
    var placesAddedToTour = [];

    while(placesAddedToTour.length < coordinateArray.length) {

        if (placesAddedToTour.length < coordinateArray.length) {
            var coordinateA = startCoordinate;
            var smallestDistance = Infinity;
            var closestCoordinate;

            // Route always starts in Amsterdam
            if (placesAddedToTour.length === 0) {
                var coordinateA = coordinateAmsterdam;
            }            

            for (i in coordinateArray) {
                var coordinateB = coordinateArray[i];

                if (placesAddedToTour.indexOf(coordinateB) == -1) {
                    var currentDistance = d3.geo.distance(coordinateA, coordinateB);

                    if (currentDistance < smallestDistance) {
                        smallestDistance = currentDistance;
                        closestCoordinate = coordinateB;
                    }
                }
            }
            // Add route to tourRoute, remember place added to tourRoute
            tourRoute.push([coordinateA, closestCoordinate]);

            //countriesArraytemp[i] = countriesArray[tourcoordinates.indexOf(closestCoordinate)];


            placesAddedToTour.push(closestCoordinate);
            startCoordinate = closestCoordinate;
        }

        // Route always ends in Amsterdam
        if (placesAddedToTour.length === coordinateArray.length) {
            for (i in coordinateArray) {
                if (placesAddedToTour.indexOf(coordinateArray[i]) == -1) {
                    var closestCoordinate = coordinateArray[i];
                }
            }
            tourRoute.push([closestCoordinate, coordinateAmsterdam]);
        }
    }

    for(var temp2 = 0; temp2 < placesAddedToTour.length; temp2++) {
        for(var temp = 0; temp < features.length; temp++) {
            if(d3.geo.distance(placesAddedToTour[temp2],cleanPath.centroid(features[temp])) == 0) {
                countriesArray.push(features[temp]['properties']['name']);
            }

        }
    }

    tourCountries(countriesArray);

    // Draw lines for route
    for (var i in tourRoute) {
        routeLines.push({ 
            type: "LineString",
            coordinates: tourRoute[i],
            color: 'orange'
        });
    }

    d3.select('g.zoom')
        .append('g')
        .attr('class', 'routelines')
        .selectAll("path .edge") 
        .data(routeLines)
        .enter()
        .append("path")
        .attr("class", "edge")
        .attr("d", this.path)
        .style('stroke', '#00F5F1')
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke-width", "2")
        
    map.drawDots(placesAddedToTour);
}

Map.prototype.drawTour = function () {
    var features = topojson.feature(this.topojson, this.topojson.objects.units).features,
        cleanPath = d3.geo.path().projection(null);

    //fill coordinateArray with tour countries
    //[ "AS", "EU", "AF", "NA", "SA", "OC", "AN" ]
    //gets it from continentSelected which is the dropdown selector
    var coordinateArray =  []

    //return top 5 countries with proper continent and artist

    if(searchBar.currentArtist !== null){
        url = 'api/streamwatch/tour/country?continent=' + continentSelected + '&mbId=' + searchBar.currentArtist;
    }else {
        url = 'api/streamwatch/tour/country?continent=' + continentSelected;
    }

    var promise = new Promise(function(resolve, reject) {
        d3.json(url, function(err, data) {
            (err) ? reject(err) : resolve(data);
        });
    }).then(function (data) {
        var tourSize = 5;
        var dots = [];

        for (var i = 0; i < data.length; i++) {
            var id = data[i]._id,
                count = data[i].count;
            for (var y = 0; y < features.length; y++) {
                if ( features[y].id ==  id && id != 'NL'){
                    dots.push(cleanPath.centroid(features[y]));
                    break;
                }
            }
        }
        if(dots.length > tourSize) {
            coordinateArray = dots.slice(0,5);
        }else{
            coordinateArray = dots;
        }
        
        //draw tour lines and dots
        console.log(coordinateArray);
        map.drawDotLines(coordinateArray);


    });

}

Map.prototype.hideLines = function () {
    d3.selectAll('.lines .edge')
        .transition()
        .duration(1500)
        .ease("linear")
        .style('opacity', 0)
        .attr("stroke-dashoffset", function() { return -this.getTotalLength(); } )
}

Map.prototype.hideTour = function () {
    d3.selectAll('.routelines .edge')
        .transition()
        .duration(500)
        .ease("linear")
        .style('opacity', 0)
        .attr("stroke-dashoffset", function() { return -this.getTotalLength(); } )

    d3.selectAll('.dots')
        .transition()
        .duration(500)
        .ease("linear")
        .style('opacity', 0)
}

