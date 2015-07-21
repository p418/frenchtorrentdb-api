var $querystring = require('qs'),
	SearchParamList = require('./SearchParamList');


module.exports = SearchEngine = function(name, conf)
{
	this._name 		= name;
	this._params 	= new SearchParamList(name, conf, this);
}
;

SearchEngine.prototype =
{
	addParam : function(name, conf)
	{
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
	}

}