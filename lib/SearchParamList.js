var SearchParam = require('./SearchParam');


log = function(){};//console.log;

module.exports = SearchParamList = function(name, conf, parent)
{
	this._params 	= {};
	this._parent 	= parent;
	this._name	= name;
	
	log('assigning '+name+' to '+parent._name)

	var me = this;

	Object.defineProperty(this._parent, name, 
	{
		get : function(){ return me;},
		set : function(value){}
	});



	if(this._parent._name == 'root')
		Object.defineProperty(this._parent._parent, name, 
		{
			get : function(){ return me;},
			set : function(value){}
		});


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

				log(name, 'is param');


				var type = conf?conf.type:null;
				this._params[name] = SearchParam.create(type, name, conf, this);


				/**Object.defineProperty(this._parent, name, 
				{
					get : function(){ return me._params[name].value;},
					set : function(value){ return me._params[name].value = value;}
				});**/

			break;

			case (typeof conf == "object" && !conf.hasOwnProperty('default')):
				log(name, 'is param list');
				this._params[name] = new SearchParamList(name, conf, this);

				/**Object.defineProperty(this._parent, name, 
				{
					get : function(){ return me;},
					set : function(value){ return me._params[name].value = value;}
				});**/
				
			break;
			default :
				return this;
			break;

		}

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
		var obj = {}, me = this;

		Object.keys(this._params).forEach(function(param)
		{
			var paramObj = me._params[param];

			if((paramObj instanceof SearchParam && paramObj.value != null)
			|| (paramObj instanceof SearchParamList))
				obj[param] = paramObj.toJSON();

		});

		return obj;
	}
}
