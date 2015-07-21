var should = require('chai').should(),
	searchEngine = require('../lib/SearchEngine');




describe('Search Engine', function()
{
	var conf = {
		param1 : "value1",
		param2 : { default : 'value2', values : ['value2', 'value3', 'value4'], desc : 'multi value' },
		param3 : null
	};

	var mySearch = new searchEngine('search', conf);


	it('should allow access to new attributes with default value', function()
	{
		mySearch.param1.should.equal('value1');
		mySearch.param2.should.equal('value2');
		(mySearch.param3 == null).should.be.true;
	});


	it('should not let assigning param1 value different from "value1" or null', function()
	{
		mySearch.param1=123
		mySearch.param1.should.equal('value1');
		mySearch.param1=null;
		(mySearch.param1 == null).should.be.true;
		mySearch.param1='value1'
		mySearch.param1.should.equal('value1');

	});

	it('should not let assign param2 value other than "value2", "value3", "value4" or null', function()
	{
		['value2', 'value3', 'value4'].forEach(function(value)
		{
			mySearch.param2 = value;
			mySearch.param2.should.equal(value);
		});

		mySearch.param2 = 'another value';
		mySearch.param2.should.equal('value4');

		mySearch.param2 = null;
		(mySearch.param2 == null).should.be.true;
	});

	it('should let assign any value to param3', function()
	{
		['toto', 'tutu', 'titi'].forEach(function(value)
		{
			mySearch.param3 = value;
			mySearch.param3.should.equal(value);
		});
	});	

	it('should construct querystring from parameters values', function()
	{
		mySearch.param1 = 'value1';
		mySearch.param2 = 'value3';
		mySearch.param3 = 'value7';

		mySearch.toString().should.equal('param1=value1&param2=value3&param3=value7');
	})

	it('should ommit null value within querystring transformation', function()
	{
		mySearch.param2 = null;
		mySearch.toString().should.equal('param1=value1&param3=value7');
	});

	it('should add new parameter', function()
	{
		mySearch.addParam('param4', 'test');
		mySearch.param4.should.equal('test');
	});

	it('should add new complex parameter', function()
	{
		mySearch.addParam('param5', { s : { 
												'a' : { values : ['a', 'b'], default : 'b'}, 
												'b' : 'c',
												'c' : 'd' 
									}});

		mySearch.param5.isList().should.be.true;
		mySearch.param5.s.isList().should.be.true;

		mySearch.param5.s.a.should.equal('b');
		mySearch.param5.s.b.should.equal('c');
		mySearch.param5.s.c.should.equal('d');

		mySearch.param5.s.a = 'c';
		mySearch.param5.s.a.should.equal('b');

		mySearch.param5.s.a = 'a';
		mySearch.param5.s.a.should.equal('a');

		mySearch.toString().should.equal('param1=value1&param3=value7&param4=test&param5%5Bs%5D%5Ba%5D=a&param5%5Bs%5D%5Bb%5D=c&param5%5Bs%5D%5Bc%5D=d');
	});
});




