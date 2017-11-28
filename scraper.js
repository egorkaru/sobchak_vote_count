// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (votes TEXT, timestamp INTEGER)");
		callback(db);
	});
}

function updateRow(db, votes) {
	// Insert some data.
	const timestamp = Date.now()/1000 | 0
	var statement = db.prepare("INSERT INTO data VALUES (?, ?)");
	statement.run(votes, timestamp);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, name FROM data", function(err, row) {
		console.log(row.id + ": " + row.name);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}

function run(db) {
	// Use request to read in pages.
	const url = 'https://sobchakprotivvseh.ru'
	const selector = 'body > div:nth-child(5) > div.section-head > div > div.col-xl-4.col-lg-4.col-md-12 > div.mini-progress-wrap.d-none.d-lg-block > div > div.mini-progress-amount.mini-progress-title > div.float-left'
	fetchPage(url, function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);

		var elements = $(selector).each(function () {
			var value = $(this).text().trim();
			updateRow(db, value);
		});

		readRows(db);

		db.close();
	});
}

initDatabase(run);
