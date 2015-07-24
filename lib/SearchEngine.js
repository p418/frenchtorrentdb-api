var $querystring 	= require('qs'),
	$Promise		= require('promise'),

	SearchParamList = require('./SearchParamList'),
	SearchResult = require('./SearchResult');


module.exports = SearchEngine = function(name, conf, client)
{
	this._name 		= name;
	this._client	= client;
	this._params 	= new SearchParamList(name, conf, this);
};

SearchEngine.prototype =
{
	addParam : function(name, conf)
	{
		if(!this.hasOwnProperty(name))
			this._params.add(name, conf, this);
		return this;
	},
	toJSON	: function()
	{
		return this._params.toJSON();
	},
	toString : function()
	{
		return $querystring.stringify(this.toJSON());
	},
	setValues : function(values)
	{
		for(var i in values)
		{
			if(!this._params.hasOwnProperty(i))
				throw new Error(i+' isnt a valid parameter for '+this._name+' search, check your definition file');

			this[i] = values[i];
		}

		return this;
	},
	search : function(params)
	{
		if(typeof params == 'string')
		{
			this.setValues({ name : params });
		}
		else if(typeof params == 'object')
		{
			this.setValues(params);
		}

		return this.execute();
	},
	execute : function()
	{
		var endpoint 	= this._client.getEndpoint('search') +'&'+this.toString(),
			httpClient 	= this._client,
			me 			= this;

		return new $Promise(function(resolve, reject)
		{

			httpClient.get(endpoint)
				.then(function(data)
				{
					if(data)
						resolve(new SearchResult(data, me));
					else
						reject('Search returned no data')
				})
				.catch(reject)
		});
	}
}