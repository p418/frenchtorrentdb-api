var $querystring = require('querystring'),
	SearchParamList = require('./SearchParamList');


module.exports = SearchEngine = function(conf)
{
	this._params = new SearchParamList(null, conf, this);
}
;

SearchEngine.prototype =
{
	addParam : function(name, conf)
	{
		this._params.add(name, conf);
		return this;
	},
	toJSON	: function()
	{
		return this._params.toJSON();
	},
	toString : function()
	{
		return $querystring.stringify(this.toJSON());
	}

}