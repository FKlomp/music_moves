var fs = require('fs'),
    csv = require('csv');

fs.readFile('public/js/vendor/d3-geomap/topojson/world/countries.json', function (err, json) {
    if (err) throw err;
    
    var countries = JSON.parse(json);
    var geometries = countries.objects.units.geometries;
    
    fs.readFile('public/data/country_codes.csv', function (err, data) {
        if (err) throw err;
        
        csv.parse(data, function(err, codes){
            for (var i = 0; i < geometries.length; i++) {
                var three_letter_code = geometries[i].id,
                    two_letter_code = null;

                for (var y = 0; y < codes.length; y++) {
                    if ( codes[y].indexOf(three_letter_code) >= 0 ) {
                        two_letter_code = codes[y][1]
                        break;
                    }
                }
                
                if (two_letter_code) {
                    geometries[i].id = two_letter_code;
                } else {
                    console.log(three_letter_code + ' not found...');
                }
            }
            
            fs.writeFile('public/data/countries.json', JSON.stringify(countries));
        });
    });
});