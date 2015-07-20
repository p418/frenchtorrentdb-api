
module.exports = SearchParam = function(name, conf, parent)
{
	this._name 		= name;
	this._values	= null;
	this._default 	= null;
	this._value		= null;
	this._parent 	= parent;
	this.load(conf);
}

SearchParam.prototype = 
{
	isList	: function(){ return false; },
	load : function(conf)
	{
		switch(true)
		{
			case (conf == "null" || conf == void 0):
			break;

			case (typeof conf == "object" && conf.hasOwnProperty('default')):

				this._values 		= conf.values||null;
				this._default		= conf.default;
				this._value 		= conf.default;
				this.description 	= conf.desc||'N/A';

			break;

			default : 
				this._values 	= [conf];
				this._default	= conf; 
				this._value		= conf; 
			break;
		}

		var me = this;

		Object.defineProperty(this._parent, this._name, 
		{
			get : function(){ return me;},
			set : function(value){ return me.value = value;}
		});	

		return this;
	},
	toJSON : function()
	{
		return this.toString();
	},
	toString : function()
	{
		return this.value;
	},

	get value(){ return this._value; },
	set value(value){
		if(value==null || this._values == null || (this._values != null && this._values.indexOf(value) != -1))
			return this._value = value;
		return this._value;
	}

};