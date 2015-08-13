// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
	console.log('Method ----------------------');
	console.log(req.method);
	console.log('Request URL ----------------------');
	console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
	console.log('Headers ----------------------');
    console.log(req.headers);
	console.log('Body ----------------------');
	console.log(req.body);
    next(); // make sure we go to the next routes and don't stop here
});

/******** GET SHEET TAB NAMES OF SPREADSHEET ********/
router.route('/service/account/:client_id/file/:file_id/sheets')
	.get(function(req, res) {
		var GoogleSpreadsheet = require("google-spreadsheet");
		var my_sheet = new GoogleSpreadsheet(req.params.file_id);
		var creds = require('./keys/' + req.params.client_id + '/' + req.params.client_id + '.json');
		
		my_sheet.useServiceAccountAuth(creds, function(err){
			// getInfo returns info about the sheet and an array or "worksheet" objects 
			my_sheet.getInfo( function( err, sheet_info ){
				
				var response = {};
				response.sheets = [];				
				
				var ctr = 1;
				sheet_info.worksheets.forEach(function(element, index){
					response.sheets.push({
						id: ctr++,
						title: element.title
					});
				});
				
				res.status(200).send(response);
			});
		});
	});

/******** GET COLUMNS OF SHEET ********/
router.route('/service/account/:client_id/file/:file_id/sheet/:sheet_id/columns')
	.get(function(req, res) {
		var GoogleSpreadsheet = require("google-spreadsheet");
		var my_sheet = new GoogleSpreadsheet(req.params.file_id);
		var creds = require('./keys/' + req.params.client_id + '/' + req.params.client_id + '.json');
		
		my_sheet.useServiceAccountAuth(creds, function(err){
			// getInfo returns info about the sheet and an array or "worksheet" objects 
			my_sheet.getInfo( function( err, sheet_info ){
				
				var sheet = sheet_info.worksheets[parseInt(req.params.sheet_id) - 1]
								
				sheet.getRows( function( err, rows ){
					var columns = [];
					
					// Parse xml to object
					var parseString = require('xml2js').parseString;
					var xml = rows[0]._xml;
					parseString(xml, function (err, result) {
						// Extract properties that have 'gsx:' prefix in it
						for (var property in result.entry) {
							if (result.entry.hasOwnProperty(property)) {
								if (property.substr(0, 4) == 'gsx:'){
									columns.push(property.substr(4));	
								}								
							}
						}
						
						res.status(200).send(columns);
					});
				});		
			});
		});
	});
	
/******** GET/POST SHEET DATA ********/
router.route('/service/account/:client_id/file/:file_id/sheet/:sheet_id/data')
	.get(function(req, res) {
		var GoogleSpreadsheet = require("google-spreadsheet");
		var my_sheet = new GoogleSpreadsheet(req.params.file_id);
		var creds = require('./keys/' + req.params.client_id + '/' + req.params.client_id + '.json');
		
		my_sheet.useServiceAccountAuth(creds, function(err){
			// getInfo returns info about the sheet and an array or "worksheet" objects 
			my_sheet.getInfo( function( err, sheet_info ){
				
				var sheet = sheet_info.worksheets[parseInt(req.params.sheet_id) - 1]
								
				sheet.getRows( function( err, rows ){
					var data = [];
					
					// Parse xml to object
					var parseString = require('xml2js').parseString;
					
					rows.forEach(function(element){
						var xml = element._xml;
						parseString(xml, function (err, result) {
							var obj = {};
							// Extract properties that have 'gsx:' prefix in it
							for (var property in result.entry) {
								if (result.entry.hasOwnProperty(property)) {
									if (property.substr(0, 4) == 'gsx:'){								
										obj[property.substr(4)] = result.entry[property][0];
									}								
									
								}
							}
							data.push(obj);	
						});	
					});										
					
					res.status(200).send({rows: data});
				});		
			});		
		});
	})
	.post(function(req, res){
		var GoogleSpreadsheet = require("google-spreadsheet");
		var my_sheet = new GoogleSpreadsheet(req.params.file_id);
		var creds = require('./keys/' + req.params.client_id + '/' + req.params.client_id + '.json');
		
		my_sheet.useServiceAccountAuth(creds, function(err){
			
			req.body.rows.forEach(function(element){
				my_sheet.addRow(parseInt(req.params.sheet_id), element);
			});
			
			res.status(200).send();			
		});
	});
	

// REGISTER OUR ROUTES -------------------------------
// Route prefix
app.use('/api/v1', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);