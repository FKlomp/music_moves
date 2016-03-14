var format = function(d) {
			    d = d;
			    return d3.format(',.00f')(d);
			}

			//domein van kleurtjes
			var domainArray = [1,100];


			var map = d3.geomap.choropleth()
			    .geofile('js/vendor/d3-geomap/topojson/world/countries.json')
			    .colors(colorbrewer.Reds[9])
			    .column('2014-04-01T00:00:00.000Z') //nog animeren
				.domain(domainArray)
			    .format(format)
			    .legend(true)
			    .unitId('Country Code');

			d3.csv('/data/streamwatchr_dump.csv', function(error, data) {
				d3.csv('/data/country_codes.csv', function(error2, data2) {
					var totalData = getData(data,data2);
					console.log(totalData);
					d3.select('#map')
					.datum(totalData)
					.call(map.draw, map);




					function getData(data,data2)
					{
						//maak object per land
						var totalData = [];
						var iso2Code = 'Country Code2';
						for(var i = 0; i < data2.length; i++) 
						{
							var country = {'Country Code2' : data2[i].Alpha_2, 'Country Code' : data2[i].Alpha_3};
							totalData.push(country);
						}

						//count bij bijbehorende tijd, als bijbehorend tijd er niet is maak die aan en count
						for(var i = 0; i < data.length; i++)
						{
							var country = data[i].country;
							var date = data[i].date;
							var place = findObject(totalData,iso2Code,country);
							if(place && data[i].count)
							{
								if (totalData[place][date]) 
								{
									totalData[place][date] += parseInt(data[i].count);
								}
								else
								{
									
									totalData[place][date] = parseInt(data[i].count);
								}
							}
						}
						return totalData;
					}

					function findObject(objectArray,property,name)
					{
						for(var i = 0; i < objectArray.length; i++)
						{
							if (objectArray[i][property] == name)
							{
								return(i);
							}
						}

					}
				});
			});
