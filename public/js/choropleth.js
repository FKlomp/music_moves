'use strict';

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
