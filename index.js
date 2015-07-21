#!/usr/bin/nodejs


var $http = require('request'),
	$promise = require('promise'),
	$url = require('url'),
	$merge = require('merge');

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
}



FTDBClient.prototype = 
{
	getEndpoint : function(endpointName)
	{
		if(!this.endpoints && this.endpoints.hasOwnProperty(endpointName))
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
		var json = json||false;


		var opts = { method : 'POST', url : endpoint };
		$merge.recursive(opts, this.httpOptions);

		return new $promise(function(resolve, reject)
		{
			$http(opts, function(err, response, body)
			{
				if(err)
					reject(err);
				else
				{
					resolve(json?JSON.parse(body):body);
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
			.catch(reject);	
		});
		
	},
	post : function(endpoint, form)
	{

		var me 		= this, 
			opts 	= $merge.recursive({ method : 'POST', url : endpoint, form : form }, me.httpOptions);

		return new $promise(function(resolve, reject)
		{
			$http(opts, function(err, response, body)
			{
				if(err)
					reject(err);
				else
					resolve(body);
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
		this.credentials = require(process.cwd()+'/'+filename);
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
							resolve(resp);
						else
							reject(resp);
					})
					.catch(reject);
				}
				else
					reject('No challenge/hash found');
			})
			.catch(reject);
		});
	}

};

module.exports = FTDBClient;
