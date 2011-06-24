$( document ).ready( function() {
	$( '#msg' ).hide();
	$( '#hudform' ).submit( function( e ) {

		$( '#view' ).html( '' );

		$( '#overlay' ).addClass( 'fullscreen' );
		$( '#overlay' ).show();
		$( '#msg' ).show( 'slow' ).html( 'Fetching HUD data.<br/><br/><img src="/images/loading.gif"/>' );

		e.preventDefault();
		var data =  $( '#hudform' ).serialize();
		$.ajax( {
			type: "POST",
			url: "/",
			data: data,
			success: function( d ) {

				var pprice_ids = [];


				var table = $( '<table><thead><th>Property Case</th><th>Address</th><th>City</th><th>State</th><th>Zip Code</th><th>County</th><th>Price</th><th>Previous Price</th><th>Bed</th><th>Bath</th><th>Square Footage</th><th>Year Built</th><th>As Is Value</th><th>FHA Financing</th><th>List Date</th><th>Bid Open Date</th><th>Listing Period</th><th>Status</th></thead>' );
				table.attr( 'id', 'result' );

				for ( var a in d ) {
					var tr = $( '<tr>' );

					pprice_ids.push( d[a].id );

					tr.append( $( '<td>' ).html( d[a].id ));
					tr.append( $( '<td>' ).html( d[a].street ));
					tr.append( $( '<td>' ).html( d[a].city ));
					tr.append( $( '<td>' ).html( d[a].state ));
					tr.append( $( '<td>' ).html( d[a].zip ));
					tr.append( $( '<td>' ).html( d[a].county ));
					tr.append( $( '<td>' ).html( d[a].price ));
					tr.append( $( '<td>' ).html( d[a].pprice ).attr( 'id', d[a].id + 'pprice' ) );
					tr.append( $( '<td>' ).html( d[a].bed ));
					tr.append( $( '<td>' ).html( d[a].bath ));
					tr.append( $( '<td>' ).html( d[a].sqft ));
					tr.append( $( '<td>' ).html( d[a].yb ));
					tr.append( $( '<td>' ).html( d[a].aiv ));
					tr.append( $( '<td>' ).html( d[a].fha ));
					tr.append( $( '<td>' ).html( d[a].obd ));
					tr.append( $( '<td>' ).html( d[a].lp ));
					tr.append( $( '<td>' ).html( d[a].stat ));

					table.append( tr );
				}
				$( '#view' ).append( table );
				$( '#result' ).tablesorter();

				var o = {};
				o.prices = pprice_ids;
				o.day_offset = data.offset || 0;
				$( '#msg' ).html( 'Fetching Price data.<br/><br/><img src="/images/loading.gif"/>' );
				$.ajax( {
					type: "POST",
					url: "/prices",
					data: o,
					success: function( d ) {

						for ( var pd in d ) {
							console.log( d[pd].orig );
						}

						$( '#overlay' ).removeClass( 'fullscreen' );
						$( '#overlay' ).hide();
						$( '#msg' ).hide( 'slow' );
					}
				});
			}
		});
	});
});
