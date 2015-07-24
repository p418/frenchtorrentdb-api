#!/usr/bin/nodejs


process.chdir(__dirname);


var FTDBClient 		= require('../'),
	$fs 			= require('fs'),
	$path 			= require('path') 
	searchFolder 	= '../search',
	name 			= (process.argv[2]||'').trim(),
	forms			= ['films', 'series', 'tv', 'jeux', 'apps', 'musiques', 'xxx', 'autres'];


var installed = Object.keys(require(searchFolder));

if(!name)
{
	var usage = 'Please provide a form name to retrieve \n\nWithin:\n';
		
	forms.forEach(function(form)
	{
		usage += '\n\t - '+form;
		if(installed.indexOf(form) != -1)
			usage += ' (installed)';
	});

	usage += '\n\t ------------------------------';
	usage += '\n\t - all : to override existing and install others';
	usage += '\n\t - any : to install non installed';

	console.log(usage+'\n');
	process.exit(1);
}



switch(name)
{
	case 'all': var toInstall = forms; break;
	case 'any': var toInstall = forms.filter(function(a){ return installed.indexOf(a) == -1; }); break;
	default : var toInstall = [name];break;
}

var FTDB = new FTDBClient();

process.stdout.write('Connecting to Tracker...');
FTDB.loadCredential('../config/credentials.json').login()
.then(function()
{
	process.stdout.write('done\n');

	toInstall.forEach(function(name)
	{
		
		FTDB.getSearchFormDefinition(name).then(function(def)
		{
			process.stdout.write('Parsing form '+name+'\n');

			var filePath = $path.resolve(searchFolder, name+'.json');
			var data = JSON.stringify(def, null, ' ');
			process.stdout.write('Save into '+filePath+'...');	
			$fs.writeFileSync(filePath, data);
			process.stdout.write('done\n');
		});
	});
	
})
.catch(console.error);