$( document ).ready(function() {
    $('#search-bar').change(function () {
        $.get('api/streamwatch/song', {q: $(this).val()})
        .done(function( data ) {
            var resultDiv = $('#search-results')
            resultDiv.empty('');
            
            for (var i = 0; i < data.length; i++) {
                var row = '<tr>' +
                    '<td>' + data[i].artists[0].name + '</td>' +
					'<td>' + data[i].song + '</td>' +
					'<td>N/A</td>' +
				'</tr>';
                
                resultDiv.append(row); 
            }
        });
    })
});