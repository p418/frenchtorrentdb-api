var $cheerio	= require('cheerio'), 
	$util		= require('util');

//@see http://stackoverflow.com/a/8596808
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}



module.exports = SearchResult = function(html, search)
{
	if(html == void 0)
		throw new Error('no data to parse');

	this.search 		= search;
	this.data 			= $cheerio.load(html);
	this.rowSet 		= null;
	this.cursor			= 0;

	this.cleanup().parse();
};

SearchResult.FETCH_JSON 	= 1;
SearchResult.FETCH_ARRAY 	=  2;
SearchResult.FETCH_XML 		= 3;
SearchResult.FETCH_CLASS 	= 4;


SearchResult.prototype.cleanup = function()
{
	this.data('script').remove();
	return this;
}

SearchResult.prototype.parse = function()
{
	var $ = this.data, uls = $('ul');
	
	var rowSet = this.rowSet = [];

	uls.each(function(index, ul)
	{
		var row = new SearchResultRow();

	 	$(ul).find('li').each(function(idx, li)
	 	{
	 		var name 	= $(li).attr('class').split(' ')[0];
	 		var value 	= $(li).text().trim();
			
			row.set(name, value);

			$(li).find('a').each(function(idx, link)
			{
				row.set(name+'_link', $(link).attr('href'));
			})


	 	});

	 	rowSet.push(row);
	});

};

SearchResult.prototype.rowCount = function()
{
	return this.rowSet.length;
};


SearchResult.prototype.reset = function()
{
	this.cursor = 0;
	return this;
}

SearchResult.prototype.fetch = function(fetchMode, option)
{
	var fetchMode = fetchMode||SearchResult.FETCH_JSON;

	if(this.cursor >= this.rowCount())
		return null;

	return this.rowSet[this.cursor++].to(fetchMode, option);
}

SearchResult.prototype.fetchAll = function(fetchMode, option)
{
	var  result = [], row;

	this.reset();
	while(row = this.fetch(fetchMode, option))
	{
		result.push(row);
	}

	return result;
}


function SearchResultRow()
{
	this.columns 	= [];
	this.values		= [];

	this.data 		= {};
}

SearchResultRow.prototype = {

	set : function(column, value)
	{
		this.columns.push(column);
		this.values.push(value);

		this.data[column] = value;

		return this;
	},
	getColumn : function(idx)
	{
		var idx = idx||0;
		return this.values[idx];
	},
	toClass : function(constructor){ return new constructor(this.toJSON()); },
	toJSON 	: function(){ return this.data; },
	toArray : function(){ return this.values; },
	toXML	: function(tagname)
	{
		var tagname = tagname||'item', xml = [];

		for(var i in this.data)
			xml.push($util.format('\t<%s>%s</%s>', i, this.data[i], i));

		return $util.format('<%s>\n%s\n</%s>', tagname, xml.join('\n'), tagname);
	},
	to : function(format, option)
	{
		switch(format)
		{
			case SearchResult.FETCH_ARRAY 	: return this.toArray();
			case SearchResult.FETCH_XML 	: return this.toXML(option);
			default: return this.toJSON();
		}
	}
};