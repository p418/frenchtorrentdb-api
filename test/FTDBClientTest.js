var chai		= require('chai')
	should 		= chai.should(), 
	FTDBClient 	= require('../'),
	url 		= require('url'),
	merge		= require('merge');



var credentials = require('./testFile/credentials.json'),
	global = require('../config/global.json');

process.chdir(__dirname);

describe('FTDB Tracker Client', function()
{
	this.timeout(5000);

	var FTDB = new FTDBClient();

	describe('Endpoints', function()
	{
		it('Should correctly load endpoints', function()
		{
			var loginEndpoint = url.format(merge({}, url.parse(global.host),  global.endpoints.login));
			FTDB.getEndpoint('login').should.be.equal(loginEndpoint);
		});

		it('Should throw exception for unknown endpoint', function()
		{
			chai.expect(function(){FTDB.getEndpoint('blablabla');}).throw('blablabla endpoint is undefined');
		});

	});


	describe('Credential', function()
	{
		it('Should correctly assign credential', function()
		{
			FTDB.setCredential(credentials.username, credentials.password);
			FTDB.credentials.should.deep.equal(credentials);
		});

		it('Should correctly load credential from file', function()
		{
			FTDB.setCredential(null,null).loadCredential('./testFile/credentials.json');
			FTDB.credentials.should.deep.equal(credentials);
		});
	});

	
	describe('Login', function()
	{
		it('Should resolve challenge', function()
		{
			var challenge = require('./testFile/challenge.json');
			FTDB.resolveChallenge(challenge)
				.challenge.should.equal('f24f11f7e4772fb47afe4a945926fabc57a616dccb1315c138bc54809e5e94444294e7a97bf0517e7842d9d97be457d4ea39bf5ecd51dc4590853d5a05f');
		});

		it('Should login to tracker', function(next)
		{
			FTDB.login()
			.then(function(res)
			{
				if(res)
					next()
				else
					next(new Error('Login failed'));

			}).catch(next);
		});

	});
	

	describe('Search', function()
	{
		it('should have serie search engine loaded', function()
		{
			FTDB.search._serie.should.be.instanceof(SearchEngine);
			FTDB.search._serie._name.should.be.equal('serie');
			FTDB.search.serie.should.be.a('function');
		});

		it('should be able to perform search', function(next)
		{
			FTDB.search.serie({ name : 'EVERYBODY.HATES.CHRIS.iNTEGRALE.FRENCH.DVDRIP.XVID-NoTaG' })
				.then(function(result)
				{
					result.should.be.instanceof(SearchResult);
					result.rowCount().should.be.equal(1);

					next();
				})
				.catch(next);
		});


		it('should fetch search using different fetch style', function(next)
		{
			FTDB.search.serie({ name : 'walking' })
				.then(function(result)
				{

					//console.log('SearchResult.FETCH_JSON: return next row as anonymous object with column names as properties');
					result.fetch(SearchResult.FETCH_JSON).should.have.any.keys('torrents_name', 'torrents_download_links');

					//console.log('SearchResult.FETCH_XML: return next row as XML fragment named "torrent" with column names as sub element ');
					result.fetch(SearchResult.FETCH_XML, 'torrent').should.be.a('string').and.contains('torrents_name');

					//console.log('SearchResult.FETCH_ARRAY: return next row as an array indexed by number');
					result.fetch(SearchResult.FETCH_ARRAY).should.be.an('array');

					next();
				})
				.catch(next);
		});

		
		/**it('should fetch result set as rss feed', function(next)
		{
			FTDB.search.series({ name : 'game of', season : '01', episode : '01' })
				.then(function(result)
				{
					console.log(result.fetchAll(SearchResult.FETCH_JSON));
					next();
				})
				.catch(next);
		});**/
		


		it('should be able to parse a new search form', function(next)
		{
			FTDB.getSearchFormDefinition('films').then(function(def)
			{
				def.should.include.keys('name', 'adv_cat', 'group');
				next();
			}, next);
		});


	});
});

