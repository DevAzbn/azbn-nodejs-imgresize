

var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
var imagic = require('imagemagick');


if(argv.help) {
	console.log('\t--maxw="2048"\t\tМаксимальная ширина, пикс.'); // argv.maxw
	console.log('\t--maxh="2048"\t\tМаксимальная высота, пикс.'); // argv.maxh
	console.log('\t--dir="строка"\t\tДиректория поиска (по умолчанию ./)'); // argv.dir
	//console.log('\t--set="строка"\t\tЗаменять на (по умолчанию не заменяет)'); // argv.set
	//console.log('\t--fmask="строка"\tПоиск только в файлах, в имени которых есть данная строка'); // argv.fmask
	//console.log('\t--help\t\t\tВывод этой справки'); // argv.help
	process.exit(0);
}


var		root = argv.dir ? argv.dir : './',
		maxw = argv.maxw ? parseInt(argv.maxw) : 2048,
		maxh = argv.maxh ? parseInt(argv.maxh) : 2048,
		//re_search = new RegExp('(' + argv.search + ')', 'ig'),
		fmask = argv.fmask ? new RegExp('(' + argv.fmask + ')', 'ig') : new RegExp('(.jpg)', 'ig')
;

var AnalAndResize = function(path) {
	
	imagic.resize({
		srcPath : path,
		dstPath : path + '.resize.jpg',
		width : maxw,
		//height : maxh,
	}, function(err, stdout, stderr){
		if (err) throw err;
	});
	
}

var walk = function(dir, done) {
	
	var results = [];
	
	fs.readdir(dir, function(err, list) {
		
		if (err) return done(err);
		
		var pending = list.length;
		
		if (!pending) return done(null, results);
		
		list.forEach(function(file) {
			
			var in_masked = 0;
			
			if(fmask != false) {
				in_masked = file.search(fmask);//fmask.test(file);
			}
			
			var _file = path.normalize(path.resolve(dir, file));
			//console.log(':' + _file);
			
			fs.stat(_file, function(err, stat) {
				
				if (stat && stat.isDirectory()) {
					
					walk(_file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
					
				} else if(in_masked > -1 && stat && stat.isFile()) {
					
					//results.push(file);
					//console.log(':' + _file);
					
					//searchInFile(_file, re_search, argv.set);
					
					AnalAndResize(_file);
					
					if (!--pending) done(null, results);
					
				}
				
			});
			
		});
		
	});
	
};


walk(root, function(err, res){
	if(err) {
		console.log(err);
	} else {
		
	}
});
