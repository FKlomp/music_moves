var format = function(d) {
    d = d;
    return d3.format(',.00f')(d);
}

var width = 1152,
    height = 600;

var domainArray = [1, 100];
    
var map = d3.geomap.choropleth()
    .geofile('js/vendor/d3-geomap/topojson/world/countries.json')
    .projection(d3.geo.naturalEarth)
    .width(width)
    .height(height)
    .scale(200)
    .translate([width / 2, height / 2])
    .zoomFactor(2)
    .colors(colorbrewer.Reds[9])
    .column('2014-04-01T00:00:00.000Z') //nog animeren
    .domain(domainArray)
    .format(format)
    .legend(true, {transform: "translate(0,320)"})
    .unitId('Country Code');

var projection = d3.geo.naturalEarth().scale(map.properties.scale).translate(map.properties.translate).precision(0.1);

var path = d3.geo.path()
    .projection(projection);

d3.csv('/data/streamwatchr_dump.csv', function(error, data) {
    d3.csv('/data/country_codes.csv', function(error2, data2) {
        var totalData = getData(data, data2);
        console.log(totalData);
        d3.select('#map')
            .datum(totalData)
            .call(map.draw, map);
        
        setTimeout(function () {
            d3.select('g.zoom')
                .append('g')
                .selectAll("path .edge") 
                .data([{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [-60.8909347, 20.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [37.618423, 55.751244]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [42.8909347, 57.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [10.8909347, 15.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [20.8909347, 30.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [1.8909347, 3.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [40.8909347, 10.3738007]
                    ]
                },{ 
                    "type": "LineString",
                    "coordinates": [
                        [4.8909347, 52.3738007], [60.8909347, 20.3738007]
                    ]
                }])
                .enter()
                .append("path")
                .attr("class", "edge")
                .attr("d", path)
                .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); } )
                .attr("stroke-dashoffset", function() { return this.getTotalLength(); } )
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", 0);
        }, 1000);
    });
});

function getData(data, data2) {
    //maak object per land
    var totalData = [];
    var iso2Code = 'Country Code2';
    for (var i = 0; i < data2.length; i++) {
        var country = {
            'Country Code2': data2[i].Alpha_2,
            'Country Code': data2[i].Alpha_3
        };
        totalData.push(country);
    }

    //count bij bijbehorende tijd, als bijbehorend tijd er niet is maak die aan en count
    for (var i = 0; i < data.length; i++) {
        var country = data[i].country;
        var date = data[i].date;
        var place = findObject(totalData, iso2Code, country);
        if (place && data[i].count) {
            if (totalData[place][date]) {
                totalData[place][date] += parseInt(data[i].count);
            } else {

                totalData[place][date] = parseInt(data[i].count);
            }
        }
    }
    return totalData;
}

function findObject(objectArray, property, name) {
    for (var i = 0; i < objectArray.length; i++) {
        if (objectArray[i][property] == name) {
            return (i);
        }
    }

}