var redis = require( "redis" ),
	client = redis.createClient(),
	http = require( 'http' ),
	express = require('express'),
	app = module.exports = express.createServer();

client.on( "error", function( err ) {
	console.log( "Error: " + err );
});

function price_from_redis( id ) {
}

function store_price( id, price ) {
}

var url_opts = {
	zipCode: "",
	city: "",
	county: "",
	sState: "",
	fromPrice: "0",
	toPrice: "0",
	caseNumber: "",
	bed: "0",
	bath: "0",
	street: "",
	buyerType: "0",
	specialProgram: "",
	Status: "0"
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'HUD Viewer'
  });
});

var return_data = [];
function build_obj( res, req, skip_date_update ) {

	var data = [];

	var hud_query;
	if ( req ) {
		hud_query = build_hud_query( req.body );
	} else {
		hud_query = build_hud_query();
	}

	var http_req = http.get( hud_query, function( http_res ) {
		console.log( "Status Code from HUD: %s", http_res.statusCode );
		http_res.on( 'data', function( chunk ) {
			data.push( chunk.toString() );
		}).on( 'error', function( e ) {
			console.log( e.message );
		}).on( 'end', function() {
			var s = data.join( "" );
			s = s.split( "\n" );

			return_data = [];
			var date = Date();

			for ( var i = 0, l = s.length; i < l; i++ ) {
				if ( s[i].match( /<td>/ ) ) {
					var parts = s[i].split( "<td>" );

					var z = {};

					z.id = parts[1].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.street = parts[2].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.city = parts[3].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.state = parts[4].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.zip = parts[5].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.county = parts[6].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.price = parts[7].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.pprice = "Not available yet";
					z.bed = parts[8].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.bath = parts[9].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.sqft = parts[10].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.yb = parts[11].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.aiv = parts[12].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.fha = parts[13].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.obd = parts[14].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.lp = parts[15].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );
					z.stat = parts[16].replace( /\t|\r|<td>|td>|<\/td>/g, ""  );

					if ( ! skip_date_update ) client.hset( z.id, date, z.price );
					// client.hset( z.id, date, z.price );

					return_data.push( z );
				}
			}
			if ( res ) {
				res.send( return_data );
			}
		});
	});

};

setTimeout( function() {
	console.log( "Updating full list" );
	build_obj();
}, 86400000 );

function build_hud_query( obj ) {
	var req_string = [];

	var hud_opts = {
		host: "www.hudhomestore.com",
		path: "/pages/PortalHUDListExportToExcel.aspx",
		port: 80,
		method: 'GET'
	};

	var count = 0;
	for ( var o in url_opts) {
		if ( obj && obj[o] ) {
			if ( count === 0 ) {
				req_string.push( "?" + o + "=" + obj[o] );
			} else {
				req_string.push( "&" + o + "=" + obj[o] );
			}
		} else {
			if ( count === 0 ) {
				req_string.push( "?" + o + "=" + url_opts[o] );
			} else {
				req_string.push( "&" + o + "=" + url_opts[o] );
			}
		}
		count++;
	}

	hud_opts.path = hud_opts.path + req_string.join( "" );
	console.log( hud_opts.path );

	return hud_opts 
}

app.post( '/', function( req, res ) {
	build_obj( res, req, true );
});

app.post( '/price', function( req, res ) {
	// res.write( "[" );
	client.hvals( req.body.id, function( errs, replies ) {
		var o = {};
		o.id = req.body.id;

		if ( req.body.offset > 0 ) {
			o.orig = replies[ replies.length - req.body.offset];
		} else {
			o.orig = replies[0];
		}

		o.latest = replies[ replies.length -1 ];
		res.send( JSON.stringify( o ) );
	});
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
