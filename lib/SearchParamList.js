var SearchParam = require('./SearchParam');


module.exports = SearchParamList = function(name, conf, parent)
{
	this._name		= name;
	this._params 	= {};
	this._parent 	= parent;

	if(conf != void 0 && conf != null)
		this.load(conf);
}


SearchParamList.prototype = 
{
	isList	: function(){ return true; },
	add 	: function(name, conf)
	{
		var me = this;

		switch(true)
		{
			case (conf == null || (typeof conf == "string")
				|| (typeof conf == "object" && conf.hasOwnProperty('default'))):

				this._params[name] = new SearchParam(name, conf, this);


				/**Object.defineProperty(this._parent, name, 
				{
					get : function(){ return me._params[name].value;},
					set : function(value){ return me._params[name].value = value;}
				});	**/		

			break;

			case (typeof conf == "object" && !conf.hasOwnProperty('default')):

				this._params[name] = new SearchParamList(name, this._parent[name]);

				/**Object.defineProperty(this._parent, name, 
				{
					get : function(){ return me._params[name];},
					set : function(value){}
				});**/
				/**
				for(var i in conf)
				{
					this._params[name].add(i, conf[i]);		
				}		**/
		
			break;
			default :

			break;

		}


		Object.defineProperty(this._parent, name, 
		{
			get : function(){ return me[name].value;},
			set : function(value){ return me[name].value = value;}
		});


		return this;
	},
	load : function(conf)
	{
		for(var name in conf)
		{
			if(!conf.hasOwnProperty(name))
				continue; 

			var subConf = conf[name];
			this.add(name, subConf);
		}

		return this;
	},
	toJSON : function()
	{
		var obj = {};

		for(var i in this._params)
		{
			if((this._params[i] instanceof SearchParam &&  this._params[i].value!= null) 
				|| this._params[i] instanceof SearchParamList)
				obj[i] = this._params[i].toJSON();
		}

		return obj;
	}
}
