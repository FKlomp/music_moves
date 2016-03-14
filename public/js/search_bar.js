$( document ).ready(function() {
    var selectedQueryType = 0,
        queryTypes = [{
            name: 'Song',
            url: 'api/streamwatch/song'
        },{
            name: 'Artist',
            url: 'api/streamwatch/artist'
        }];
    
    $('#filter-button').html(queryTypes[selectedQueryType].name + ' <span class="caret"></span>');
    
    var buildDropdown = function () {
        $('#filter-dropdown').empty();

        for (var i = 0; i < queryTypes.length; i++) {
            if(i != selectedQueryType) {
                $('<li><a id="query-' + i + '" class="filter-option" href="#">' + queryTypes[i].name + '</a></li>')
                .appendTo('#filter-dropdown');
            }
        }
    }
    buildDropdown();
    
    $(document).on('click', '.filter-option', function (evt) {
        selectedQueryType = evt.target.id.split('-')[1];
        $('#filter-button').html(queryTypes[selectedQueryType].name + ' <span class="caret"></span>');
        
        buildDropdown();
    });
    
    $('#search-bar').focus(function () {
        $(this).val('');
    });
    
    $('#search-results').on('click', '.list-group-item', function (evt) {
        console.log(evt.target.id) 
    });
    
    $('#search-submit').click(function () {
        $.get(queryTypes[selectedQueryType].url, {q: $('#search-bar').val()})
        .done(function( data ) {
            var i,
                row,
                resultDiv = $('#search-results');
            
            resultDiv.empty();
            
            for (i = 0; i < data.length; i++) {
                if (selectedQueryType == 0) {
                    $('<button id="' + data[i].artistMbId + '" type="button" class="list-group-item">' +
                        data[i].artists[0].name + ' - ' + data[i].song +
                        '</button>')
                    .hide()
                    .appendTo('#search-results')
                    .slideDown(500);
                } else {
                    $('<button id="' + data[i].mbId + '" type="button" class="list-group-item">' +
                        data[i].lastfm_info.artist.name +
                        '</button>')
                    .hide()
                    .appendTo('#search-results')
                    .slideDown(500);
                }
            }
            
            var removeResults = function (evt) {
                if (!evt.target.classList.contains('list-group-item')) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    
                    $('#search-results .list-group-item')
                    .slideUp(500);
                    
                    document.removeEventListener('click', removeResults, true);
                }
            };
            
            document.addEventListener('click', removeResults, true); 
        });
    })
});