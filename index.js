#!/usr/bin/nodejs


var $http 		= require('request'),
	$promise 	= require('promise'),
	$url 		= require('url'),
	$merge 		= require('merge'),
	$path 		= require('path'),
	$qs 		= require('qs'),
	$cheerio	= require('cheerio'),
	$util		= require('util');

var SearchEngine = require('./lib/SearchEngine');

//$http.debug = true;



function FTDBClient(conf)
{

	//fallback: if no conf provided, try to load default one
	if(conf == void 0)
	{
		var conf  = require(__dirname+'/config');
	}


	this.host 			= $url.parse(conf.host||'http://www.frenchtorrentdb.com');
	this.endpoints 		= conf.endpoints||{};
	this.credentials	= conf.credentials||{};
	this.cookieJar 		= $http.jar();
	this.isLogged		= false;
	this.challenge 		= null;
	this.httpOptions	= 
	{
		headers :
		{
			'User-Agent'		: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
			//'Origin'			: 'http://www.frenchtorrentdb.com',
			//'X-Requested-With'	: 'XMLHttpRequest',
			//'Accept-Encoding'	: 'gzip, deflate',
			//'Accept'			: '*/*' ,
			//'Referer'			: 'http://www.frenchtorrentdb.com/?section=LOGIN',
			//'Connection'		: 'keep-alive',
			//'Accept-Language'	: 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4' 
		},
		followAllRedirects : true,
		jar : this.cookieJar
	};


	var engines = conf.engines||null;
	this.loadSearchEngine(engines);
}



FTDBClient.prototype = 
{
	checkLoggedStatus : function()
	{
		if(this.challenge && !this.isLogged)
			throw new Error('You arent logged in');
	},
	loadSearchEngine : function(conf)
	{
		if(conf == void 0 || conf == null)
			var conf = require(__dirname+'/search');

		this.search = {};
		var me = this;
		for(var engine in conf)
		{
			this.search['_'+engine] = new SearchEngine(engine, conf[engine], this);
			Object.defineProperty(this.search, engine,
			{
				get : (function(engineName){ return function(){ var self = me.search['_'+engineName]; return self.search.bind(self); }; })(engine)
			});
		}

		return this;
	},
	getEndpoint : function(endpointName)
	{
		if(!this.endpoints || !this.endpoints.hasOwnProperty(endpointName))
			throw new Error(endpointName+' endpoint is undefined!');

		var urlObj = $merge({}, this.host, this.endpoints[endpointName]);

		return $url.format(urlObj);
	},
	resolveChallenge : function(challenge)
	{
		var secure_login = '';

		challenge.challenge.forEach(function(challengeStr)
		{
			secure_login += (new Function('a','return '+challengeStr))('05f');
		});

		challenge.challenge = secure_login;
		return challenge;
	},
	get : function(endpoint, json)
	{ 

		this.checkLoggedStatus();

		var json 	= json||false,
			opts 	= { method : 'GET', url : endpoint },
			me 		= this;

		$merge.recursive(opts, this.httpOptions);

		return new $promise(function(resolve, reject)
		{
			$http(opts, function(err, response, body)
			{
				if(err)
					reject.call(me, err);
				else
				{
					resolve.call(me, json?JSON.parse(body):body);
				}
			}); 
		});
	},
	getJSON : function(endpoint){ return this.get(endpoint, true); },
	getChallenge : function()
	{	
		var me = this;
		return new $promise(function(resolve, reject)
		{
			me.getJSON(me.getEndpoint('challenge'))
			.then(function(res)
			{
				if(res && res.success)
					resolve(me.resolveChallenge(res));
				else
					reject(res);
			})
			.catch(reject.bind(me));	
		});
		
	},
	post : function(endpoint, form)
	{
		this.checkLoggedStatus();

		var me 		= this, 
			opts 	= $merge.recursive({ method : 'POST', url : endpoint, form : form }, me.httpOptions);

		return new $promise(function(resolve, reject)
		{
			$http(opts, function(err, response, body)
			{
				if(err)
					reject.call(me, err);
				else
					resolve.call(me, body);
			})
		});
	},
	setCredential : function(username, password)
	{
		this.credentials.username = username;
		this.credentials.password = password;

		return this;
	},
	loadCredential : function(filename)
	{
		this.credentials = require($path.resolve(process.cwd(),filename));
		//this.credentials = require(filename);
		return this;
	},
	login : function(challenge, hash)
	{
		var me = this;


		if(!me.credentials || !me.credentials.username || !me.credentials.password)
			throw new Error('No credentials provided');


		return new $promise(function(resolve, reject)
		{
			me.getChallenge()
			.then(function(challenge)
			{
				if(challenge.challenge && challenge.hash)
				{

					me.post(me.getEndpoint('login'),
					{
						username 		: me.credentials.username,
						password 		: me.credentials.password,
						secure_login 	: challenge.challenge,
						hash 			: challenge.hash
					})
					.then(function(resp)
					{ 
						var resp = JSON.parse(resp);
						if(resp && resp.success)
						{
							me.challenge = challenge;
							resolve.call(me, me.isLogged=true);
						}
						else
							reject.call(me, resp);
					})
					.catch(reject.bind(me));
				}
				else
					reject.call(me, 'No challenge/hash found');
			})
			.catch(reject.bind(me));
		});
	},
	getSearchFormDefinition : function(name)
	{
		var name 	= name||'index',
			url 	= this.getEndpoint('form')+'&group='+name;


		return new $promise(function(resolve, reject)
		{
			this.get(url)
			.then(function(html)
			{
				var $ 		= $cheerio.load(html),
					inputs 	= $('#form :input, .results_index :input'),
					fields	= {},
					script	= [];

				var getScript = function(name, val)
				{
					var m;if(m=/^(.+)\[\]$/.exec(name))
						return $util.format('obj.%s.push(%s) ;', m[1], JSON.stringify(val)); 		

					name = name.replace(/(\[[^'"\]]+\])/g, function(match){  return match.replace('[', '[\'').replace(']', '\']'); });
					return $util.format('obj.%s=%s;', name, JSON.stringify(val)); 
				}

				inputs.each(function(index, input)
				{
					var input 	= $(input),
						tagname = input[0].tagName,
						name 	= input.attr('name'),
						type 	= input.attr('type')||'text',
						value 	= input.val()||null,
						desc	= input.next().text()||(input[0].nextSibling?input[0].nextSibling.nodeValue:'');

					if(name == 'search')
						return;

					fields[name] = null;
					switch(tagname)
					{
						case 'input':
							switch(type)
							{
								case 'hidden'	: script.push(getScript(name, value));	break;
								case 'text'		: script.push(getScript(name, value?{ default: value }:null)); break;
								case 'checkbox' : script.push(getScript(name, { default : null, values : [value], type : type, desc : desc })); break; 
							}
						break;

						case 'select':
							var vals = [];
							input.find('option').each(function(idx, opt){ vals.push($(opt).val());});
							script.push(getScript(name, {default : value, values : vals, type : tagname }));
						break;
					}
				});

				var def = ($qs.parse($qs.stringify(fields,  { strictNullHandling: true }),  { strictNullHandling: true, arrayLimit : 0 }));

				resolve((new Function('obj',script.join('\n')+' return obj;'))(def)) ;
			})
			.catch(reject)

		}.bind(this));
	}

};

module.exports = FTDBClient;
