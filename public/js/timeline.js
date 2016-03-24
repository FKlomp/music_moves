
var TimeLine = function (options) {
    this.options = this.options = $.extend({
        dateFormat: d3.time.format("%b-%y"),
        returnFormat: d3.time.format("%Y-%m-%d"),
        onUpdate: function (begin, end) {
            console.log('on update', begin, end);
        }
    }, options)
}

TimeLine.prototype.getMonthCount = function (d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    
    return months <= 0 ? 0 : months;
}

TimeLine.prototype.convertToMonth = function (i) {
    var date = new Date(this.minDate);
    date.setMonth(+i);
    
    return date; 
}

TimeLine.prototype.updateMonths = function (data) {
    this.begin = this.convertToMonth(data[0]);
    this.end = this.convertToMonth(data[1]);
    
    this.updateLabel();
}

TimeLine.prototype.getMonths = function () {
    return [this.options.returnFormat(this.begin), this.options.returnFormat(this.end)];
}

TimeLine.prototype.updateLabel = function () {
    $('.slider .tooltip-inner').html(this.options.dateFormat(this.begin) + ' : ' + this.options.dateFormat(this.end))
}

TimeLine.prototype.setSlider = function (data) {
    this.minDate = new Date(data[0]);
    this.maxDate = new Date(data[1]);
    this.count = this.getMonthCount(this.minDate, this.maxDate);
    
    this.slider = new Slider("#timeslider", {
        min: 0, 
        max: this.count,
        value: [0, this.count],
        tooltip: 'always',
        tooltip_position:'top'
    });
    
    this.updateMonths([0, this.count]);
    
    this.slider.on("slideStop", this.onUpdate.bind(this));
    this.slider.on('slide', this.updateMonths.bind(this));
    
    $('#timeslider-div').show();
}

TimeLine.prototype.onUpdate = function (evt) {
    this.updateMonths(evt);
    
    this.options.onUpdate(this.getMonths()[0], this.getMonths()[1]);
}
