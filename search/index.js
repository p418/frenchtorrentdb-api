var $fs 	= require('fs'),
	$path 	= require('path');


$fs.readdirSync(__dirname).map(function(file)
{
	if(/\.(json)$/i.test(file))
	{
		var name = $path.basename(file, '.json');
		module.exports[name] = require(__dirname+'/'+name);
	}	
});
