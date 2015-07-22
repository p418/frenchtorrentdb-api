var should 			= require('chai').should(),
	searchResult 	= require('../lib/SearchResult');

process.chdir(__dirname);

var html = require('fs').readFileSync('./testFile/series.html').toString();

describe('Search Result Parsing', function()
{
	var result = new searchResult(html);


	it('should parse result page', function()
	{
		result.rowCount().should.be.equal(30);
	});


	it('should fetch first row as JSON', function()
	{
		var row = result.fetch(searchResult.FETCH_JSON);
		row.should.include.keys('torrents_name', 'torrents_download_link');
	});

	it('should fetch second row as array', function()
	{
		var row = result.fetch(searchResult.FETCH_ARRAY);
		row.should.include('Diane.Femme.Flic.S06E01.FRENCH.720p.HDTV.x264-FRiES');
	});

	it('should have moved cursor 2 times', function()
	{
		result.cursor.should.be.equal(2);
	});

	it('should break at 30th and last row', function()
	{
		var counter = 0, nbRows = result.reset().rowCount(), row;

		while(row = result.fetch())
			counter++;

		counter.should.be.equal(nbRows);
	});


	it('should fetch all rows according fetch mode', function()
	{
		var res = result.fetchAll();
		res.length.should.be.equal(30);

		var res = result.fetchAll(searchResult.FETCH_JSON);
		res[10].should.include.keys('torrents_name', 'torrents_download_link');

		var res = result.fetchAll(searchResult.FETCH_ARRAY);
		res[21].should.include('Copper.S01E09.PROPER.FRENCH.720p.HDTV.x264-HYBRiS');

	});


});