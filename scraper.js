// This is a template for a Node.js scraper on morph.io (https://morph.io)

const cheerio = require("cheerio");
const request = require("request");
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
	const statement = db.prepare("INSERT INTO data VALUES (?, ?)");
	statement.run(votes, timestamp);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	const on = (timestamp) => new Date(Number(timestamp, 0)*1000).toGMTString()
	
	db.each("SELECT rowid AS id, votes, timestamp FROM data", function(err, row) {
		console.log(row.id + ": " + row.votes + " : " + on(row.timestamp));
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, (error, response, body) => {
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
	const selector = 'div:nth-child(5) div.section-head div div.col-xl-4.col-lg-4.col-md-12 div.mini-progress-wrap.d-none.d-lg-block div div.mini-progress-amount.mini-progress-title div.float-left'
	fetchPage(url, function (body) {
		// Use cheerio to find things in the page with css selectors.
		const $ = cheerio.load(body)

		const elements = $(selector).each(function () {
			const value = $(this).text().trim()
			updateRow(db, value)
		})

		readRows(db)

		db.close()
	})
}

initDatabase(run);
