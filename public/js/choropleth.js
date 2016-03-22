'use strict';

var config = {
    columns: ['2013-01-01T00:00:00Z','2013-02-01T00:00:00Z','2013-03-01T00:00:00Z','2013-06-01T00:00:00Z','2013-07-01T00:00:00Z','2013-08-01T00:00:00Z','2013-09-01T00:00:00Z','2013-10-01T00:00:00Z','2013-11-01T00:00:00Z','2013-12-01T00:00:00Z',
    '2014-01-01T00:00:00Z','2014-02-01T00:00:00Z','2014-03-01T00:00:00Z','2014-04-01T00:00:00Z','2014-05-01T00:00:00Z','2014-06-01T00:00:00Z','2014-07-01T00:00:00Z','2014-08-01T00:00:00Z','2014-09-01T00:00:00Z','2014-10-01T00:00:00Z','2014-11-01T00:00:00Z','2014-12-01T00:00:00Z',
    '2015-01-01T00:00:00Z','2015-02-01T00:00:00Z','2015-03-01T00:00:00Z','2015-04-01T00:00:00Z','2015-05-01T00:00:00Z','2015-06-01T00:00:00Z','2015-07-01T00:00:00Z','2015-08-01T00:00:00Z','2015-09-01T00:00:00Z','2015-10-01T00:00:00Z','2015-11-01T00:00:00Z','2015-12-01T00:00:00Z' ],
    animate: "True"
};
var steps = parseInt('9' || 9, 10); // avoid errors when steps is not set
var scheme = 'YlOrRd' || 'YlGnBu';

config.format = 'f' || ',.02f';
config.scheme = scheme;
config.steps = steps;
config.domain = '[1500, 3800]' || null;
var column = '2006-08';


document.querySelector('a[scheme="' + config.scheme + '"]').parentNode.setAttribute('class', 'active');

if (config.animate) {
    $('#animate').click(function (e) {
        var cols = config.columns.slice();
        var animation = setInterval(function () {
            var col = cols.shift();
            if (col) {
                map.column(col).update();
                title(map);
                annotation(map);
            } else {
                clearInterval(animation);
            }
        }, 500);
    });
}

d3.selectAll('#map-select a').on('click', function () {
    var clicked = d3.event.target;
    d3.selectAll('#map-select li').attr('class', '');
    d3.select(clicked.parentNode).attr('class', 'active');
    map.column(clicked.textContent).update();
    annotation(map);
});

d3.selectAll('#color-select a').on('click', function () {
    var clicked = d3.event.target;
    scheme = clicked.getAttribute('scheme');
    if (colorbrewer.hasOwnProperty(scheme)) {
        d3.selectAll('#color-select li').attr('class', '');
        d3.select(clicked.parentNode).attr('class', 'active');
        map.colors(colorbrewer[scheme][config.steps]).update();
    }
});
