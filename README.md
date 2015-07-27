# FrenchTorrentDB-API

Node module designed to expose a "pseudo" api from [FrenchtorrentDB](http://frenchtorrentdb.com), a French private tracker.
For the moment, only torrent search is supported.

## Installation

```sh
npm install frenchtorrentdb-api
```

## Usage
```js
var FTDBClient = require('frenchtorrentdb-api'); 


var FTDB = new FTDBClient(); //instanciate a new Client.
```

### Credential

Before performing any action, you must define credential to log in to FTDB tracker with.

You can assign credential programmatically.

```js
FTDB.setCredential(credentials.username, credentials.password);
```
Or load credential from a file.

```js
FTDB.loadCredential('./credentials.json');
```

Credential file is simply a `.json` file which contains login information this way:

```json
{
	"username" 	: "mycoolusername",
	"password"	: "this_is_my_passw0rd"	
}
```

### Login

Once, credential is defined, you can perform login process by calling `login()` which return a [`Promise`](https://www.npmjs.com/package/promise).

```js
FTDB.login()
.then(function(res)
{
	if(res)
	{
		console.log("Ok, i'm logged in, what's next?")
	}
	else
		new Error('Login failed'));
})
.catch(console.error);
```

You can also chain calls:

```js
FTDB
	.loadCredential('./credential.json')
	.login()
	.then(function(res)
	{
		... some code here
	})
	.catch(console.error);
```

## API

### Search
For now, search action is the only supported.
You can search against any form from:

[http://www.frenchtorrentdb.com/?section=TORRENTS](http://www.frenchtorrentdb.com/?section=TORRENTS).

Search is based on definition `json` files, generated by a script (`scripts/installSearch`) and located into `search` folder.
You can easily create your own for a custom search with fixed values by editing/copying an existing one.


To perform a search, just call `.search.<searchformname>(<form values>)` where `searchformname` is basically the basename of our definition file from `search` folder.

_exemple:_

_I want to search for an episode of my favorite show_

```js
FTDB.search.serie({ name : 'EVERYBODY.HATES.CHRIS.iNTEGRALE.FRENCH.DVDRIP.XVID-NoTaG' })
	.then(function(result)
	{
		... result is and instance of SearchResult;
	})
	.catch(next);
```


## Class: SearchResult 

Represents a result set associated to a search action

### Predefined Constants
The constants below are defined by the module.

<dl>
	<dt>SearchResult.FETCH_JSON</dt>
	<dd>Specifies that the fetch method shall return each row as an object with property names that correspond to column names returned in the result set.</dd>
	<dt>SearchResult.FETCH_ARRAY</dt>
	<dd>Specifies that the fetch method shall return each row as an array indexed by column number as returned in the corresponding result set, starting at column 0.</dd>
	<dt>SearchResult.FETCH_XML</dt>
	<dd>Specifies that the fetch method shall return each row as a xml fragment with sub element tagname that correspond to column names returned in the result set.</dd>
</dl>


### Prototype Methods
These methods are invoked on a `SearchResult` instance by calling `SearchResult.methodName`


### SearchResult#fetch([fetchStyle[, fetchOptions])
Fetches the next row from a result set.

<dl>
	<dt>parameters</dt>
	<dd>
		<dl>
			<dt>fetchStyle</dt>
			<dd>Controls how row will be returned to the call. This value must be one of the SearchResult.FETCH_* constants. (default: SearchResult.FETCH_JSON)</dd>
			<dt>fetchOptions</dt>
			<dd>Extra parameter passed to row fetcher. (ie: tagname for XML fetch, etc) </dd>
		</dl>		
	</dd>
	<dt>return values</dt>
	<dd>
		The return value of this method depends on the fetch type. In all cases, *null* is returned on faillure.
	</dd>
</dl>

**Examples**

Example#1 : Fetching rows using different fetch style

```js
FTDB.search.series({ name : 'walking' })
	.then(function(result)
	{

		console.log('SearchResult.FETCH_JSON: return next row as anonymous object with column names as properties');
		console.log(result.fetch(SearchResult.FETCH_JSON));

		console.log('SearchResult.FETCH_XML: return next row as XML fragment named "torrent" with column names as sub element ');
		console.log(result.fetch(SearchResult.FETCH_XML, 'torrent'));

		console.log('SearchResult.FETCH_ARRAY: return next row as an array indexed by number');
		console.log(result.fetch(SearchResult.FETCH_ARRAY));

		next();
	})
	.catch(next);
```

the above example will ouput:

```
SearchResult.FETCH_JSON: return next row as anonymous object with column names as properties

{ categories_parent_cat: '',
  categories_parent_cat_link: '?section=TORRENTS&module=&parent_cat_id=13',
  torrents_category: 'XviD',
  torrents_category_link: '?section=TORRENTS&module=&parent_cat_id=13&cid=101',
  torrents_name: 'The.Walking.Dead.S05E13.FASTSUB.VOSTFR.HDTV.XviD-ADDiCTiON',
  torrents_name_link: '/?section=INFOS&hash=000C5AA...#FTD_MENU',
  torrents_size: '349.04 MB',
  torrents_seeders: '2862',
  torrents_leechers: '26',
  imdb_id_imdb_id: '',
  torrents_calendar: '',
  torrents_download: '',
  torrents_download_link: '/?section=DOWNLOAD&id=652..&uid=80...&get=1&hash=63e4a65...' }

SearchResult.FETCH_XML: return next row as XML fragment named "torrent" with column names as sub element 

<torrent>
	<categories_parent_cat></categories_parent_cat>
	<categories_parent_cat_link>?section=TORRENTS&module=&parent_cat_id=13</categories_parent_cat_link>
	<torrents_category>XviD</torrents_category>
	<torrents_category_link>?section=TORRENTS&module=&parent_cat_id=13&cid=101</torrents_category_link>
	<torrents_name>The.Walking.Dead.S05E15.FASTSUB.VOSTFR.HDTV.XviD-ADDiCTiON</torrents_name>
	<torrents_name_link>/?section=INFOS&hash=000C5AA...#FTD_MENU</torrents_name_link>
	<torrents_size>349.12 MB</torrents_size>
	<torrents_seeders>2274</torrents_seeders>
	<torrents_leechers>10</torrents_leechers>
	<imdb_id_imdb_id></imdb_id_imdb_id>
	<torrents_calendar></torrents_calendar>
	<torrents_download></torrents_download>
	<torrents_download_link>/?section=DOWNLOAD&id=6544..&uid=809..&get=1&hash=e78bd7b1...</torrents_download_link>
</torrent>

SearchResult.FETCH_ARRAY: return next row as an array indexed by number

[ '',
  '?section=TORRENTS&module=&parent_cat_id=13',
  'XviD',
  '?section=TORRENTS&module=&parent_cat_id=13&cid=101',
  'The.Walking.Dead.S05E05.FASTSUB.VOSTFR.HDTV.XviD-ADDiCTiON',
  '/?section=INFOS&hash=000C5AA5...#FTD_MENU',
  '349.14 MB',
  '2246',
  '4',
  '',
  '',
  '',
  '/?section=DOWNLOAD&id=632..&uid=80..&get=1&hash=6f382....' ]
```

Example#2 : Fetching result set as xml

```js
FTDB.search.series({ name : 'game of', season : '01', episode : '01' })
	.then(function(result)
	{
		var row, xml=[
			"<?xml version='1.0' encoding='ISO-8859-1' ?>",
			'<torrents>'
		];

		while(row=result.fetch(SearchResult.FETCH_XML, 'item'))
			xml.push('\t'+row.replace(/&/g, '&amp;'));

		xml.push('</torrents>');

		console.log(xml.join('\n'));

		next();
	})
	.catch(next);
```

the above example will ouput:

```xml
<?xml version='1.0' encoding='ISO-8859-1' ?>
<torrents>
	<item>
	<categories_parent_cat></categories_parent_cat>
	<categories_parent_cat_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=12</categories_parent_cat_link>
	<torrents_category></torrents_category>
	<torrents_category_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=12&amp;cid=95</torrents_category_link>
	<torrents_name>Game.Of.Thrones.S01E01.FRENCH.BDRip.XviD-JMT</torrents_name>
	<torrents_name_link>/?section=INFOS&amp;hash=000C5AA500..#FTD_MENU</torrents_name_link>
	<torrents_size>550.12 MB</torrents_size>
	<torrents_seeders>55</torrents_seeders>
	<torrents_leechers>0</torrents_leechers>
	<imdb_id_imdb_id></imdb_id_imdb_id>
	<torrents_calendar></torrents_calendar>
	<torrents_download></torrents_download>
	<torrents_download_link>/?section=DOWNLOAD&amp;id=3761..&amp;uid=8096..&amp;get=1&amp;hash=200c0f93e5..</torrents_download_link>
</item>
	<item>
	<categories_parent_cat></categories_parent_cat>
	<categories_parent_cat_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=36</categories_parent_cat_link>
	<torrents_category></torrents_category>
	<torrents_category_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=36&amp;cid=190</torrents_category_link>
	<torrents_name>Game.Of.Thrones.S01E01.FRENCH.720P.BluRay.x264-JMT</torrents_name>
	<torrents_name_link>/?section=INFOS&amp;hash=000C5AA500..#FTD_MENU</torrents_name_link>
	<torrents_size>2.19 GB</torrents_size>
	<torrents_seeders>4</torrents_seeders>
	<torrents_leechers>0</torrents_leechers>
	<imdb_id_imdb_id></imdb_id_imdb_id>
	<torrents_calendar></torrents_calendar>
	<torrents_download></torrents_download>
	<torrents_download_link>/?section=DOWNLOAD&amp;id=3761..&amp;uid=8096..&amp;get=1&amp;hash=c1a99a4589..</torrents_download_link>
</item>
	<item>
	<categories_parent_cat></categories_parent_cat>
	<categories_parent_cat_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=36</categories_parent_cat_link>
	<torrents_category></torrents_category>
	<torrents_category_link>?section=TORRENTS&amp;module=&amp;parent_cat_id=36&amp;cid=190</torrents_category_link>
	<torrents_name>Game.Of.Thrones.S01E01.FRENCH.720P.HDTV.x264-BAWLS</torrents_name>
	<torrents_name_link>/?section=INFOS&amp;hash=000C5AA500..#FTD_MENU</torrents_name_link>
	<torrents_size>1.62 GB</torrents_size>
	<torrents_seeders>6</torrents_seeders>
	<torrents_leechers>0</torrents_leechers>
	<imdb_id_imdb_id></imdb_id_imdb_id>
	<torrents_calendar></torrents_calendar>
	<torrents_download></torrents_download>
	<torrents_download_link>/?section=DOWNLOAD&amp;id=3535..&amp;uid=8096..&amp;get=1&amp;hash=50e4c6e7ba..</torrents_download_link>
</item>
...
...
</torrents>
```

### SearchResult#fetchAll([fetchStyle[, fetchOptions])
Returns an array containing all of the result set rows

<dl>
	<dt>parameters</dt>
	<dd>
		<dl>
			<dt>fetchStyle</dt>
			<dd>Controls the contents of the returned array as documented in [SearchResult#fetch()](#searchresultfetchallfetchstyle-fetchoptions)</dd>
		</dl>		
	</dd>
	<dt>return values</dt>
	<dd>
		The returned array contains all rows in the result set.
		The array represents each row fetched as specified by fetchStyle parameter.
		An empty array is returned if there are zero results to fetch.
	</dd>
</dl>

**Examples**

Fetch all rows as object/json


```js
FTDB.search.series({ name : 'game of', season : '01', episode : '01' })
	.then(function(result)
	{
		console.log(result.fetchAll(SearchResult.FETCH_JSON));
		next();
	})
	.catch(next);
```

the above example will ouput:

```js
[ { categories_parent_cat: '',
    categories_parent_cat_link: '?section=TORRENTS&module=&parent_cat_id=12',
    torrents_category: '',
    torrents_category_link: '?section=TORRENTS&module=&parent_cat_id=12&cid=95',
    torrents_name: 'Game.Of.Thrones.S01E01.FRENCH.BDRip.XviD-JMT',
    torrents_name_link: '/?section=INFOS&hash=000C5AA500..#FTD_MENU',
    torrents_size: '550.12 MB',
    torrents_seeders: '55',
    torrents_leechers: '0',
    imdb_id_imdb_id: '',
    torrents_calendar: '',
    torrents_download: '',
    torrents_download_link: '/?section=DOWNLOAD&id=3761..&uid=8096..&get=1&hash=200c0f93e5..' },
  { categories_parent_cat: '',
    categories_parent_cat_link: '?section=TORRENTS&module=&parent_cat_id=36',
    torrents_category: '',
    torrents_category_link: '?section=TORRENTS&module=&parent_cat_id=36&cid=190',
    torrents_name: 'Game.Of.Thrones.S01E01.FRENCH.720P.BluRay.x264-JMT',
    torrents_name_link: '/?section=INFOS&hash=000C5AA500..#FTD_MENU',
    torrents_size: '2.19 GB',
    torrents_seeders: '4',
    torrents_leechers: '0',
    imdb_id_imdb_id: '',
    torrents_calendar: '',
    torrents_download: '',
    torrents_download_link: '/?section=DOWNLOAD&id=3761..&uid=8096..&get=1&hash=c1a99a4589..' },
  { categories_parent_cat: '',
    categories_parent_cat_link: '?section=TORRENTS&module=&parent_cat_id=36',
    torrents_category: '',
    torrents_category_link: '?section=TORRENTS&module=&parent_cat_id=36&cid=190',
    torrents_name: 'Game.Of.Thrones.S01E01.FRENCH.720P.HDTV.x264-BAWLS',
    torrents_name_link: '/?section=INFOS&hash=000C5AA500..#FTD_MENU',
    torrents_size: '1.62 GB',
    torrents_seeders: '6',
    torrents_leechers: '0',
    imdb_id_imdb_id: '',
    torrents_calendar: '',
    torrents_download: '',
    torrents_download_link: '/?section=DOWNLOAD&id=3535..&uid=8096..&get=1&hash=50e4c6e7ba..' },
...
]
```

### SearchResult#rowCount()
Returns the number of rows returned by search action
