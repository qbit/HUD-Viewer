function parse_date( str ) {
	var mdy = str.split( '/' );
	return new Date( mdy[2], mdy[0]-1, mdy[1] );
}

function day_diff( first, second ) {
	return ( second-first) / ( 1000*60*60*24 );
}

$( document ).ready( function() {

	var today = Date.today().toString( 'M/d/yyyy' );

	$( '#hide' ).click( function() {
		$( '.normal' ).remove();
		$( '#result' ).trigger( "update" ).trigger( "sorton").trigger("appendCache").trigger("applyWidgets");
	});

	$( '#msg' ).hide();
	$( '#hudform' ).submit( function( e ) {

		$( '#view' ).html( '' );

		$( '#overlay' ).addClass( 'fullscreen' );
		$( '#overlay' ).show();
		$( '#msg' ).show( 'slow' ).html( 'Fetching HUD data.<br/><br/><img src="/images/loading.gif"/>' );

		e.preventDefault();
		var data =  $( '#hudform' ).serialize();
		var offset = $( '#offset' ).val();
		$.ajax( {
			type: "POST",
			url: "/",
			data: data,
			success: function( d ) {

				var pprice_ids = [];


				var table = $( '<table><thead><th>Property Case</th><th>Address</th><th>City</th><th>State</th><th>Zip Code</th><th>County</th><th>Current Price</th><th>% Discount</th><th>Previous Price</th><th>Price Delta</th><th>Bed</th><th>Bath</th><th>Square Footage</th><th>Year Built</th><th>As Is Value</th><th>FHA Financing</th><th>List Date</th><th>Today\'s Date - List Date</th><th>Bid Open Date</th><th>Listing Period</th><th>Status</th></thead>' );
				table.attr( 'id', 'result' );

				for ( var a in d ) {
					var tr = $( '<tr>' );

					pprice_ids.push( d[a].id );

					var percent_dc = new Number( parseInt( d[a].price, 10 ) / parseInt( d[a].aiv )  * 100 ).toFixed( 0 );

					tr.append( $( '<td>' ).html( d[a].id ));
					tr.append( $( '<td>' ).html( d[a].street ));
					tr.append( $( '<td>' ).html( d[a].city ));
					tr.append( $( '<td>' ).html( d[a].state ));
					tr.append( $( '<td>' ).html( d[a].zip ));
					tr.append( $( '<td>' ).html( d[a].county ));
					tr.append( $( '<td>' ).html( d[a].price ).addClass( 'right' ));
					tr.append( $( '<td>' ).html( percent_dc ) );
					tr.append( $( '<td>' ).html( d[a].pprice ).attr( 'id', d[a].id + 'pprice' ).addClass( 'right' ) );
					tr.append( $( '<td>' ).html( 0 ).attr( 'id', d[a].id + 'delta' ).addClass( 'right' ) );
					tr.append( $( '<td>' ).html( d[a].bed ));
					tr.append( $( '<td>' ).html( d[a].bath ));
					tr.append( $( '<td>' ).html( d[a].sqft ).addClass( 'right' ));
					tr.append( $( '<td>' ).html( d[a].yb ));
					tr.append( $( '<td>' ).html( d[a].aiv ).addClass( 'right' ));
					tr.append( $( '<td>' ).html( d[a].fha ));
					tr.append( $( '<td>' ).html( d[a].ld ));
					tr.append( $( '<td>' ).html( day_diff( parse_date( d[a].ld ), parse_date( today ) ) ));
					tr.append( $( '<td>' ).html( d[a].obd ));
					tr.append( $( '<td>' ).html( d[a].lp ));
					tr.append( $( '<td>' ).html( d[a].stat ));

					table.append( tr );
				}
				$( '#view' ).append( table );

				var o = {};
				$( '#msg' ).html( 'Fetching Price data.<br/><br/><img src="/images/loading.gif"/>' );
				var count = 0;
				for ( var i = 0, l = pprice_ids.length; i < l; i++ ) {
					var o = {};
					o.id = pprice_ids[i];
					o.offset = offset;
					$.ajax( {
						type: "POST",
						url: "/price",
						data: o,
						success: function( d ) {

							var delta = 0;
							d = JSON.parse( d );
							var css = "normal";

							d.orig = parseInt( d.orig, 10 );
							d.latest = parseInt( d.latest, 10 );

							if ( d.orig < d.latest ) {
								css = "increased";
								delta = d.orig - d.latest;
							} 
							if ( d.orig > d.latest ) {
								css = "reduced";
								delta = d.latest - d.orig;
							}

							$( '#' + d.id + 'pprice' ).html( d.orig );
							$( '#' + d.id + 'delta' ).html( delta );
							$( '#' + d.id + 'pprice' ).parent().addClass( css );
							count++;
						}
					});
				}

				var len = pprice_ids.length;
				var update_iv = setInterval( function() {
					if ( len === count ) {
						clearInterval( update_iv );
						$( '#result' ).tablesorter();
						$( '#overlay' ).removeClass( 'fullscreen' );
						$( '#overlay' ).hide();
						$( '#msg' ).hide( 'slow' );
					}
				});
			}
		});
	});
});
