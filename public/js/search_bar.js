var removeResults = function (evt) {
    if (!evt.target.classList.contains('list-group-item')) {
        evt.preventDefault();
        evt.stopPropagation();

        $('#search-results .list-group-item')
        .slideUp(500);

        document.removeEventListener('click', removeResults, true);
    }
};

var SearchBar = function (options) {
    this.searchTypes = {
        COUNTRY: 0,
        EVENT: 1
    };
    
    this.currentCountry = null;
    this.currentEvent = null;
    
    this.options = $.extend({
        selectedQueryType: this.searchTypes.COUNTRY,
        queryTypes: [{
            name: 'Country',
            url: 'api/country'
        },{
            name: 'Event',
            url: 'api/event'
        }],
        onSubmit: function (evt) { console.log('onSubmit', evt); },
        onFilterUpdate: function (evt) { console.log('onFilterUpdate', evt); }
    }, options);
    
    $('#filter-button').html(this.options.queryTypes[this.options.selectedQueryType].name + ' <span class="caret"></span>');
    
    $('#search-bar').focus(function () { $(this).val(''); });
    
    $('#search-submit').click(this.submit.bind(this));
        
    $('#search-results').on('click', '.list-group-item', this.selectItem.bind(this));
    
    $('#search-form').submit(function (evt) {
        this.submit()
        evt.preventDefault();
    }.bind(this));
    
    $(document).on('click', '.filter-option', this.updateFilter.bind(this));
    
    this.buildDropDown();
}

SearchBar.prototype.buildDropDown = function () {
    $('#filter-dropdown').empty();

    for (var i = 0; i < this.options.queryTypes.length; i++) {
        if(i != this.options.selectedQueryType) {
            $('<li><a id="query-' + i + '" class="filter-option" href="#">' + this.options.queryTypes[i].name + '</a></li>')
            .appendTo('#filter-dropdown');
        }
    }
}

SearchBar.prototype.updateFilter = function (evt) {
    var url;
    
    this.options.selectedQueryType = parseInt(evt.target.id.split('-')[1]);
    $('#filter-button').html(this.options.queryTypes[this.options.selectedQueryType].name + ' <span class="caret"></span>');
    
    this.options.onFilterUpdate(evt);
    
    this.buildDropDown();
}

SearchBar.prototype.selectItem = function (evt) {
    var url,
        id = evt.target.id,
        resultDiv = $('#search-results');
    
    resultDiv.empty();
    
    $('#search-submit')
        .addClass('btn-danger')
        .removeClass('btn-primary')
        .html('Remove');
        
    $('#search-bar')
        .val(evt.target.textContent)
        .attr('disabled', 'disabled');

    $('#filter-button').attr('disabled', 'disabled');
    
    document.removeEventListener('click', removeResults, true);
    
    if (this.options.selectedQueryType === this.searchTypes.COUNTRY) {
        this.currentCountry = id;
    } else {
        this.currentEvent = id;
    }
    
    this.options.onSubmit(evt);
    
    /*showLoader();
        
    if (this.options.selectedQueryType === this.searchTypes.SONG) {
        url = 'api/streamwatch/song/country?song=' + encodeURI(id);
        this.currentSong = id;
    } else {
        url = 'api/streamwatch/artist/country?mbId=' + encodeURI(id) ;
        this.currentArtist = id;
    }
    
    if (url) {
        var promise = new Promise(function(resolve, reject) {
            d3.json(url, function(err, data) {
                (err) ? reject(err) : resolve(data);
            });
        }).then(function (data) {
            map.setData(data);
            
            hideLoader();
            
            map.update();

            $('#plan-tour-button').prop('disabled', false);
        });
    }*/
}

SearchBar.prototype.showCountries = function (data) {
    var i;
    
    for (i = 0; i < data.length; i++) {
        $('<button id="' + data[i].code + '" type="button" class="list-group-item">' +
            data[i].name + ' - ' + data[i].code +
            '</button>')
        .hide()
        .appendTo('#search-results')
        .slideDown(500);
    }
}

SearchBar.prototype.showEvents = function (data) {
    var i;
    
    for (i = 0; i < data.length; i++) {
        $('<button id="' + data[i].code + '" type="button" class="list-group-item">' +
            data[i].name + ' - ' + data[i].code +
            '</button>')
        .hide()
        .appendTo('#search-results')
        .slideDown(500);
    }
}

SearchBar.prototype.submit = function (evt) {
    if ($('#search-bar').is(':disabled')){
        $('#search-submit')
            .addClass('btn-primary')
            .removeClass('btn-danger')
            .html('Search');
    
        $('#search-bar')
            .val('')
            .removeAttr('disabled');
            
        $('#filter-button').removeAttr('disabled');
        
        this.currentSong = null;
        this.currentArtist = null;
        
        this.options.onSubmit(evt);
        
        return;
    }

    var query = $('#search-bar').val(),
        resultDiv = $('#search-results');
    
    resultDiv.empty();
    
    $.get(this.options.queryTypes[this.options.selectedQueryType].url, { q: query })
    .done(function (data) {
        if (this.options.selectedQueryType === this.searchTypes.COUNTRY) {
            this.showCountries(data);
        } else {
            this.showEvents(data);
        }
        
        document.addEventListener('click', removeResults, true);
    }.bind(this))
}