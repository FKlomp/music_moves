function TimeSlider(){

    var times = ['2013-01-01T00:00:00Z','2013-02-01T00:00:00Z','2013-03-01T00:00:00Z','2013-06-01T00:00:00Z','2013-07-01T00:00:00Z','2013-08-01T00:00:00Z','2013-09-01T00:00:00Z','2013-10-01T00:00:00Z','2013-11-01T00:00:00Z','2013-12-01T00:00:00Z',
        '2014-01-01T00:00:00Z','2014-02-01T00:00:00Z','2014-03-01T00:00:00Z','2014-04-01T00:00:00Z','2014-05-01T00:00:00Z','2014-06-01T00:00:00Z','2014-07-01T00:00:00Z','2014-08-01T00:00:00Z','2014-09-01T00:00:00Z','2014-10-01T00:00:00Z','2014-11-01T00:00:00Z','2014-12-01T00:00:00Z',
        '2015-01-01T00:00:00Z','2015-02-01T00:00:00Z','2015-03-01T00:00:00Z','2015-04-01T00:00:00Z','2015-05-01T00:00:00Z','2015-06-01T00:00:00Z','2015-07-01T00:00:00Z','2015-08-01T00:00:00Z','2015-09-01T00:00:00Z','2015-10-01T00:00:00Z','2015-11-01T00:00:00Z','2015-12-01T00:00:00Z' ];
        
    var slider = new Slider("#timeslider");

    slider.on("slideStop", function(slideEvt) {
        changeTime(times[slideEvt]);
        //$("#datetext").text(times[slideEvt]);
    });

    $("#timeslider-enabled").click(function() {
        if(this.checked) {
            slider.enable();
        }
        else {
            slider.disable();
        }
    });

}


function changeTime(timedata) {

    if(activeArtist != 0){
        url = 'api/streamwatch/dates/country?timeline=' + timedata + '&mbId=' + activeArtist;
    }else {
        url = 'api/streamwatch/dates/country?timeline=' + timedata;
    }

    var promise = new Promise(function(resolve, reject) {
        d3.json(url, function(err, data) {
            (err) ? reject(err) : resolve(data);
        });
    }).then(function (data) {



        map.setData(data);
        map.update();



    });
}
