var util = require('util');

module.exports = SearchParam = function(name, conf, parent)
{
	this._name 		= name;
	this._parent 	= parent;
	this._type		= 'text';
	this.load(conf);

	var me = this;

	Object.defineProperty(this._parent, this._name, 
	{
		get : function(){ return me.value;},
		set : function(value){ return me.value = value;}
	});	


	if(this._parent._name == 'root')
		Object.defineProperty(this._parent._parent, this._name, 
		{
			get : function(){ return me.value;},
			set : function(value){ return me.value = value;}
		});	
}

/**
* Static factory method
**/
SearchParam.create = function(type)
{
	var args = Array.prototype.slice.call(arguments, 1);

	switch(type)
	{
		case 'checkbox' : 
			//var ctor = CheckboxParam.bind.apply(CheckboxParam, args);
			var obj = Object.create(CheckboxParam.prototype);
			CheckboxParam.apply(obj, args);
		break;
		default:
			var ctor = SearchParam.bind.apply(SearchParam, args);
			var obj = Object.create(SearchParam.prototype);
			SearchParam.apply(obj, args);
		break;
	}

	return obj;
};



SearchParam.prototype = 
{

	_values		: null,
	_default 	: null,
	_value		: null,
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
				this._desc 			= conf.desc||'N/A';
			break;

			default : 
				this._values 	= [conf];
				this._default	= conf; 
				this._value		= conf; 
			break;
		}

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

	filterValue : function(value)
	{
		if(value==null || this._values == null || (this._values != null && this._values.indexOf(value) != -1))
			return value;
		return this._value;
	},
	get value(){ return this._value; },
	set value(value)
	{
		return this._value = this.filterValue(value);
	}

};


function CheckboxParam()
{
	CheckboxParam.super_.apply(this, arguments);
	this._type = 'checkbox';
}

util.inherits(CheckboxParam, SearchParam);


CheckboxParam.prototype.filterValue = function(value)
{
	return (!!value?this._values[0]:null);
};

